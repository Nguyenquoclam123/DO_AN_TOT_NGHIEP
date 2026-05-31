import { Injectable, NotFoundException, Logger, OnModuleInit, BadRequestException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, LessThan } from 'typeorm';
import { Campaign } from './entities/campaign.entity';
import { Job } from '../job/entities/job.entity';
import { JobSkill } from '../job/entities/job-skill.entity';
import { JobRequirement } from '../job/entities/job-requirement.entity';
import { Company } from '../company/entities/company.entity';

@Injectable()
export class CampaignService implements OnModuleInit {
    private readonly logger = new Logger(CampaignService.name);

    constructor(
        @InjectRepository(Campaign)
        private readonly campaignRepository: Repository<Campaign>,
        @InjectRepository(Job)
        private readonly jobRepository: Repository<Job>,
        private readonly dataSource: DataSource,
    ) { }

    async onModuleInit() {
        this.logger.log('CampaignService initialized. Checking for campaign status transitions...');
        await this.handleCampaignStatusTransitions();
    }

    async findAll() {
        return await this.campaignRepository.find({
            relations: ['jobs'],
            order: { createdAt: 'DESC' }
        });
    }

    async findAllByCompany(companyId: string, user?: any) {
        const company = await this.dataSource.getRepository(Company).findOne({ where: { id: companyId } });
        if (!company) {
            throw new NotFoundException('Company not found');
        }

        const isOwnerOrAdmin = user && (user.role === 'ADMIN' || user.companyId === companyId);

        if (!isOwnerOrAdmin) {
            // Public / Candidate view: only active campaigns of approved company
            if (company.status !== 'APPROVED') {
                return [];
            }

            const campaigns = await this.campaignRepository.find({
                where: { companyId, status: 'ACTIVE' },
                relations: ['jobs', 'company'],
                order: { createdAt: 'DESC' }
            });

            // Filter jobs to only show ACTIVE ones for candidates/public
            for (const campaign of campaigns) {
                if (campaign.jobs) {
                    campaign.jobs = campaign.jobs.filter(job => job.status === 'ACTIVE');
                }
            }
            return campaigns;
        }

        // Owner/Admin view
        return await this.campaignRepository.find({
            where: { companyId },
            relations: ['jobs', 'company'],
            order: { createdAt: 'DESC' }
        });
    }

    async findAllActive() {
        const campaigns = await this.campaignRepository.createQueryBuilder('campaign')
            .leftJoinAndSelect('campaign.company', 'company')
            .leftJoinAndSelect('campaign.jobs', 'jobs')
            .leftJoinAndSelect('jobs.position', 'position')
            .leftJoinAndSelect('jobs.level', 'level')
            .where('campaign.status = :status', { status: 'ACTIVE' })
            .andWhere('company.status = :companyStatus', { companyStatus: 'APPROVED' })
            .orderBy('campaign.createdAt', 'DESC')
            .getMany();

        for (const campaign of campaigns) {
            if (campaign.jobs) {
                campaign.jobs = campaign.jobs.filter(job => job.status === 'ACTIVE');

                const jobsWithStats = await Promise.all(campaign.jobs.map(async (job) => {
                    const appliedCount = await this.dataSource.getRepository('Application').count({
                        where: { jobId: job.id }
                    });
                    const interviewingCount = await this.dataSource.getRepository('Application').count({
                        where: { jobId: job.id, status: In(['INTERVIEWING', 'INVITED']) }
                    });
                    return {
                        ...job,
                        stats: {
                            appliedCount,
                            interviewingCount
                        }
                    };
                }));
                campaign.jobs = jobsWithStats;
            }
        }

        return campaigns;
    }

    async findOne(id: string, user?: any) {
        const campaign = await this.campaignRepository.findOne({
            where: { id },
            relations: ['jobs', 'jobs.position', 'jobs.level', 'company']
        });

        if (!campaign) throw new NotFoundException('Campaign not found');

        const isOwnerOrAdmin = user && (user.role === 'ADMIN' || user.companyId === campaign.companyId);

        if (!isOwnerOrAdmin) {
            if (!campaign.company || campaign.company.status !== 'APPROVED') {
                throw new BadRequestException('Chiến dịch tuyển dụng này chưa được phê duyệt.');
            }
            if (campaign.status !== 'ACTIVE') {
                throw new BadRequestException('Chiến dịch tuyển dụng này hiện không hoạt động.');
            }
        }

        if (!isOwnerOrAdmin && campaign.jobs) {
            campaign.jobs = campaign.jobs.filter(job => job.status === 'ACTIVE');
        }

        // Add counts for each job
        if (campaign.jobs && campaign.jobs.length > 0) {
            const jobsWithStats = await Promise.all(campaign.jobs.map(async (job) => {
                const appliedCount = await this.dataSource.getRepository('Application').count({
                    where: { jobId: job.id }
                });
                const interviewingCount = await this.dataSource.getRepository('Application').count({
                    where: { jobId: job.id, status: In(['INTERVIEWING', 'INVITED']) }
                });

                return {
                    ...job,
                    stats: {
                        appliedCount,
                        interviewingCount
                    }
                };
            }));
            campaign.jobs = jobsWithStats;
        }

        return campaign;
    }

    async create(data: any, user: any) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Check company approval status
            const company = await queryRunner.manager.findOne(Company, { where: { id: user.companyId } });
            const isCompanyApproved = company && company.status === 'APPROVED';

            // 1. Create Campaign
            const campaignData = {
                name: data.name,
                description: data.description,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                status: data.status || (data.startDate && new Date(data.startDate) > new Date() ? 'UPCOMING' : 'ACTIVE'),
                companyId: user.companyId
            };

            const campaign = this.campaignRepository.create(campaignData);
            const savedCampaign = await queryRunner.manager.save(campaign);

            // 2. Clone/Link Jobs from templates (data.jobIds or data.reuseJobIds)
            const templateJobIds = [...(data.jobIds || []), ...(data.reuseJobIds || [])];
            const uniqueTemplateIds = [...new Set(templateJobIds)] as string[];

            if (uniqueTemplateIds.length > 0) {
                for (const templateId of uniqueTemplateIds) {
                    const templateJob = await queryRunner.manager.findOne(Job, {
                        where: { id: templateId, companyId: user.companyId },
                        relations: ['skills', 'requirements', 'questionSets', 'campaigns']
                    });

                    if (templateJob) {
                        const hasCampaign = templateJob.campaigns && templateJob.campaigns.length > 0;
                        if (!hasCampaign) {
                            // Link existing job directly to campaign
                            templateJob.campaigns = [savedCampaign];
                            await queryRunner.manager.save(Job, templateJob);
                            this.logger.log(`Linked existing job ${templateJob.id} directly to campaign ${savedCampaign.id}`);
                        } else {
                            // Create a NEW Job record from template content
                            const newJob = new Job();
                            newJob.title = templateJob.title;
                            newJob.description = templateJob.description;
                            newJob.responsibilities = templateJob.responsibilities;
                            newJob.benefits = templateJob.benefits;
                            newJob.companyId = user.companyId;
                            newJob.categoryId = templateJob.categoryId;
                            newJob.minSalary = templateJob.minSalary;
                            newJob.maxSalary = templateJob.maxSalary;
                            newJob.workLocation = templateJob.workLocation;
                            newJob.type = templateJob.type;
                            newJob.positionId = templateJob.positionId;
                            newJob.levelId = templateJob.levelId;
                            newJob.quantity = templateJob.quantity;
                            newJob.minExperience = templateJob.minExperience;
                            newJob.experienceNote = templateJob.experienceNote;
                            newJob.minEducation = templateJob.minEducation;
                            newJob.certificates = templateJob.certificates;
                            newJob.status = isCompanyApproved ? 'ACTIVE' : 'DRAFT';
                            newJob.expiredAt = templateJob.expiredAt;
                            newJob.campaigns = [savedCampaign]; // Link to new campaign

                            const savedNewJob = await queryRunner.manager.save(Job, newJob);

                            // Clone Skills
                            if (templateJob.skills?.length) {
                                const newSkills = templateJob.skills.map(s => {
                                    const ns = new JobSkill();
                                    ns.skillName = s.skillName;
                                    ns.isRequired = s.isRequired;
                                    ns.jobId = savedNewJob.id;
                                    return ns;
                                });
                                await queryRunner.manager.save(JobSkill, newSkills);
                            }

                            // Clone Requirements
                            if (templateJob.requirements?.length) {
                                const newReqs = templateJob.requirements.map(r => {
                                    const nr = new JobRequirement();
                                    nr.requiredPosition = r.requiredPosition;
                                    nr.minYears = r.minYears;
                                    nr.industryContext = r.industryContext;
                                    nr.jobId = savedNewJob.id;
                                    return nr;
                                });
                                await queryRunner.manager.save(JobRequirement, newReqs);
                            }

                            // Link Question Sets (shared)
                            if (templateJob.questionSets?.length) {
                                savedNewJob.questionSets = templateJob.questionSets;
                                await queryRunner.manager.save(Job, savedNewJob);
                            }
                            this.logger.log(`Cloned template job ${templateJob.id} into new job ${savedNewJob.id} for campaign ${savedCampaign.id}`);
                        }
                    }
                }
            }

            await queryRunner.commitTransaction();
            return savedCampaign;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async update(id: string, data: any) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const campaign = await queryRunner.manager.findOne(Campaign, {
                where: { id },
                relations: ['jobs']
            });

            if (!campaign) {
                throw new Error('Campaign not found');
            }

            const company = await queryRunner.manager.findOne(Company, { where: { id: campaign.companyId } });
            const isCompanyApproved = company && company.status === 'APPROVED';

            const updateData: any = {};
            if (data.name) updateData.name = data.name;
            if (data.description) updateData.description = data.description;
            if (data.startDate) updateData.startDate = new Date(data.startDate);
            if (data.endDate) updateData.endDate = new Date(data.endDate);
            if (data.status) updateData.status = data.status;

            await queryRunner.manager.update(Campaign, id, updateData);

            // Recalculate status based on new dates if status is ACTIVE/UPCOMING or not provided
            // This ensures that setting a future date will force the status to UPCOMING
            let finalStatus = data.status || campaign.status;
            const isDefaultStatus = !data.status || data.status === 'ACTIVE' || data.status === 'UPCOMING';
            if (isDefaultStatus && (data.startDate || data.endDate)) {
                const updatedCampaign = await queryRunner.manager.findOne(Campaign, { where: { id } });
                const now = new Date();
                let newStatus = updatedCampaign.status;

                if (updatedCampaign.endDate && new Date(updatedCampaign.endDate) < now) {
                    newStatus = 'COMPLETED';
                } else if (updatedCampaign.startDate && new Date(updatedCampaign.startDate) > now) {
                    newStatus = 'UPCOMING';
                } else if (updatedCampaign.status === 'UPCOMING' || updatedCampaign.status === 'COMPLETED') {
                    newStatus = 'ACTIVE';
                }

                if (newStatus !== updatedCampaign.status) {
                    await queryRunner.manager.update(Campaign, id, { status: newStatus });
                    finalStatus = newStatus;
                } else {
                    finalStatus = updatedCampaign.status;
                }
            }

            // Handle Jobs: Clone new ones, Unlink removed ones
            if (data.jobIds || data.reuseJobIds) {
                const currentJobIds = campaign.jobs?.map(j => j.id) || [];
                const incomingIds = [...(data.jobIds || []), ...(data.reuseJobIds || [])];
                const uniqueIncomingIds = [...new Set(incomingIds)] as string[];

                // 1. Identify jobs to remove (unlink)
                const idsToRemove = currentJobIds.filter(cid => !uniqueIncomingIds.includes(cid));
                for (const rid of idsToRemove) {
                    const job = await queryRunner.manager.findOne(Job, { where: { id: rid }, relations: ['campaigns'] });
                    if (job) {
                        job.campaigns = job.campaigns.filter(c => c.id !== id);
                        await queryRunner.manager.save(Job, job);
                    }
                }

                // 2. Identify NEW jobs to link or clone (those not already in this campaign)
                const idsToClone = uniqueIncomingIds.filter(iid => !currentJobIds.includes(iid));
                for (const templateId of idsToClone) {
                    const templateJob = await queryRunner.manager.findOne(Job, {
                        where: { id: templateId },
                        relations: ['skills', 'requirements', 'questionSets', 'campaigns']
                    });

                    if (templateJob) {
                        const hasCampaign = templateJob.campaigns && templateJob.campaigns.length > 0;
                        if (!hasCampaign) {
                            // Link directly
                            templateJob.campaigns = [campaign];
                            await queryRunner.manager.save(Job, templateJob);
                            this.logger.log(`Linked existing job ${templateJob.id} directly to campaign ${campaign.id} during update`);
                        } else {
                            // Clone
                            const newJob = new Job();
                            newJob.title = templateJob.title;
                            newJob.description = templateJob.description;
                            newJob.responsibilities = templateJob.responsibilities;
                            newJob.benefits = templateJob.benefits;
                            newJob.companyId = templateJob.companyId;
                            newJob.categoryId = templateJob.categoryId;
                            newJob.minSalary = templateJob.minSalary;
                            newJob.maxSalary = templateJob.maxSalary;
                            newJob.workLocation = templateJob.workLocation;
                            newJob.type = templateJob.type;
                            newJob.positionId = templateJob.positionId;
                            newJob.levelId = templateJob.levelId;
                            newJob.quantity = templateJob.quantity;
                            newJob.minExperience = templateJob.minExperience;
                            newJob.experienceNote = templateJob.experienceNote;
                            newJob.minEducation = templateJob.minEducation;
                            newJob.certificates = templateJob.certificates;
                            newJob.status = isCompanyApproved ? 'ACTIVE' : 'DRAFT';
                            newJob.expiredAt = templateJob.expiredAt;
                            newJob.campaigns = [campaign];

                            const savedNewJob = await queryRunner.manager.save(Job, newJob);

                            if (templateJob.skills?.length) {
                                await queryRunner.manager.save(JobSkill, templateJob.skills.map(s => ({ ...s, id: undefined, jobId: savedNewJob.id })));
                            }
                            if (templateJob.requirements?.length) {
                                await queryRunner.manager.save(JobRequirement, templateJob.requirements.map(r => ({ ...r, id: undefined, jobId: savedNewJob.id })));
                            }
                            if (templateJob.questionSets?.length) {
                                savedNewJob.questionSets = templateJob.questionSets;
                                await queryRunner.manager.save(Job, savedNewJob);
                            }
                            this.logger.log(`Cloned template job ${templateJob.id} into new job ${savedNewJob.id} for campaign ${campaign.id} during update`);
                        }
                    }
                }
            }

            // Cascade status changes to jobs if campaign is closed or reopened
            if (finalStatus === 'COMPLETED' || finalStatus === 'ARCHIVED' || finalStatus === 'ACTIVE') {
                const campaignWithJobs = await queryRunner.manager.findOne(Campaign, {
                    where: { id },
                    relations: ['jobs']
                });
                
                if (campaignWithJobs.jobs?.length > 0) {
                    const jobIds = campaignWithJobs.jobs.map(j => j.id);
                    if (finalStatus === 'COMPLETED' || finalStatus === 'ARCHIVED') {
                        await queryRunner.manager.update(Job, jobIds, { status: 'CLOSED' });
                    } else if (finalStatus === 'ACTIVE') {
                        if (isCompanyApproved) {
                            const now = new Date();
                            for (const jId of jobIds) {
                                const job = await queryRunner.manager.findOne(Job, { where: { id: jId } });
                                if (job) {
                                    if (!job.expiredAt || new Date(job.expiredAt) > now) {
                                        job.status = 'ACTIVE';
                                    } else {
                                        job.status = 'CLOSED';
                                    }
                                    await queryRunner.manager.save(Job, job);
                                }
                            }
                        } else {
                            await queryRunner.manager.update(Job, jobIds, { status: 'DRAFT' });
                        }
                    }
                }
            }

            await queryRunner.commitTransaction();
            return { success: true };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    @Cron(CronExpression.EVERY_HOUR)
    async handleCampaignStatusTransitions() {
        this.logger.log('Running campaign status transitions task...');
        const now = new Date();
        
        // 1. Find all ACTIVE campaigns that have passed their end date -> Close them
        const expiredCampaigns = await this.campaignRepository.find({
            where: {
                status: 'ACTIVE',
                endDate: LessThan(now)
            },
            relations: ['jobs']
        });

        if (expiredCampaigns.length > 0) {
            this.logger.log(`Found ${expiredCampaigns.length} expired campaigns. Closing...`);
            for (const campaign of expiredCampaigns) {
                try {
                    await this.campaignRepository.update(campaign.id, { status: 'COMPLETED' });
                    if (campaign.jobs && campaign.jobs.length > 0) {
                        const jobIds = campaign.jobs.map(j => j.id);
                        await this.jobRepository.update(jobIds, { status: 'CLOSED' });
                    }
                    this.logger.log(`Successfully closed campaign: ${campaign.name}`);
                } catch (error) {
                    this.logger.error(`Failed to close campaign ${campaign.id}: ${error.message}`);
                }
            }
        }

        // 2. Find all UPCOMING campaigns that have reached their start date -> Open them
        const upcomingCampaigns = await this.campaignRepository.find({
            where: {
                status: 'UPCOMING',
                startDate: LessThan(now)
            }
        });

        if (upcomingCampaigns.length > 0) {
            this.logger.log(`Found ${upcomingCampaigns.length} upcoming campaigns to activate.`);
            for (const campaign of upcomingCampaigns) {
                try {
                    await this.campaignRepository.update(campaign.id, { status: 'ACTIVE' });
                    this.logger.log(`Successfully activated campaign: ${campaign.name}`);
                } catch (error) {
                    this.logger.error(`Failed to activate campaign ${campaign.id}: ${error.message}`);
                }
            }
        }
    }
}
