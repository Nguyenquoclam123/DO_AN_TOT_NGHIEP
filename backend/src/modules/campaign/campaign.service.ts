import { Injectable, NotFoundException, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, LessThan } from 'typeorm';
import { Campaign } from './entities/campaign.entity';
import { Job } from '../job/entities/job.entity';
import { JobSkill } from '../job/entities/job-skill.entity';
import { JobRequirement } from '../job/entities/job-requirement.entity';

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

    async findAllByCompany(companyId: string) {
        return await this.campaignRepository.find({
            where: { companyId },
            relations: ['jobs'],
            order: { createdAt: 'DESC' }
        });
    }

    async findAllActive() {
        return await this.campaignRepository.find({
            where: { status: 'ACTIVE' },
            relations: ['jobs', 'company'],
            order: { createdAt: 'DESC' }
        });
    }

    async findOne(id: string) {
        const campaign = await this.campaignRepository.findOne({
            where: { id },
            relations: ['jobs', 'jobs.position', 'jobs.level', 'company']
        });

        if (!campaign) throw new NotFoundException('Campaign not found');

        // Add counts for each job
        if (campaign.jobs && campaign.jobs.length > 0) {
            const jobsWithStats = await Promise.all(campaign.jobs.map(async (job) => {
                const appliedCount = await this.dataSource.getRepository('Application').count({
                    where: { jobId: job.id }
                });
                const interviewingCount = await this.dataSource.getRepository('Application').count({
                    where: { jobId: job.id, status: In(['INTERVIEWING', 'INVITED']) }
                });

                // Also get icons/top AI candidates if needed later
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

            // 2. Clone Jobs from templates (data.jobIds or data.reuseJobIds)
            const templateJobIds = [...(data.jobIds || []), ...(data.reuseJobIds || [])];
            const uniqueTemplateIds = [...new Set(templateJobIds)] as string[];

            if (uniqueTemplateIds.length > 0) {
                for (const templateId of uniqueTemplateIds) {
                    const templateJob = await queryRunner.manager.findOne(Job, {
                        where: { id: templateId, companyId: user.companyId },
                        relations: ['skills', 'requirements', 'questionSets']
                    });

                    if (templateJob) {
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
                        newJob.status = 'ACTIVE';
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

            const updateData: any = {};
            if (data.name) updateData.name = data.name;
            if (data.description) updateData.description = data.description;
            if (data.startDate) updateData.startDate = new Date(data.startDate);
            if (data.endDate) updateData.endDate = new Date(data.endDate);
            if (data.status) updateData.status = data.status;

            await queryRunner.manager.update(Campaign, id, updateData);

            // Recalculate status based on new dates if status is ACTIVE/UPCOMING or not provided
            // This ensures that setting a future date will force the status to UPCOMING
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

                // 2. Identify NEW jobs to clone (those not already in this campaign)
                const idsToClone = uniqueIncomingIds.filter(iid => !currentJobIds.includes(iid));
                for (const templateId of idsToClone) {
                    const templateJob = await queryRunner.manager.findOne(Job, {
                        where: { id: templateId },
                        relations: ['skills', 'requirements', 'questionSets']
                    });

                    if (templateJob) {
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
                        newJob.status = 'ACTIVE';
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
                    }
                }
            }

            // Cascade status changes to jobs if campaign is closed or reopened
            if (data.status === 'COMPLETED' || data.status === 'ARCHIVED' || data.status === 'ACTIVE') {
                const campaignWithJobs = await queryRunner.manager.findOne(Campaign, {
                    where: { id },
                    relations: ['jobs']
                });
                
                if (campaignWithJobs.jobs?.length > 0) {
                    const jobIds = campaignWithJobs.jobs.map(j => j.id);
                    const newJobStatus = (data.status === 'COMPLETED' || data.status === 'ARCHIVED') ? 'CLOSED' : 'ACTIVE';
                    await queryRunner.manager.update(Job, jobIds, { status: newJobStatus });
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
