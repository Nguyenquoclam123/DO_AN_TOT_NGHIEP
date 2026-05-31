import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, DeepPartial } from 'typeorm';
import { Job } from './entities/job.entity';
import { JobSkill } from './entities/job-skill.entity';
import { QuestionSet } from '../question-bank/entities/question.entity';
import { QuestionBankService } from '../question-bank/question-bank.service';
import { Campaign } from '../campaign/entities/campaign.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { AIService } from '../../ai-engine/ai.service';
import { EmbeddingService } from '../../ai-engine/embedding/embedding.service';
import { VectorSearchService } from '../../ai-engine/vector-search/vector-search.service';
import { NotificationService } from '../notification/notification.service';
import { Candidate } from '../candidate/entities/candidate.entity';
import { JobCategory } from './entities/job-category.entity';
import { CandidateCv } from '../cv/entities/candidate-cv.entity';
import { Company } from '../company/entities/company.entity';

@Injectable()
export class JobService {
    private readonly logger = new Logger(JobService.name);

    constructor(
        @InjectRepository(Job)
        private jobRepository: Repository<Job>,
        @InjectRepository(JobSkill)
        private jobSkillRepository: Repository<JobSkill>,
        @InjectRepository(QuestionSet)
        private questionSetRepository: Repository<QuestionSet>,
        @InjectRepository(Candidate)
        private candidateRepository: Repository<Candidate>,
        private aiService: AIService,
        private embeddingService: EmbeddingService,
        private vectorSearchService: VectorSearchService,
        private notificationService: NotificationService,
        private questionBankService: QuestionBankService,
        private dataSource: DataSource,
    ) { }

    async create(createJobDto: CreateJobDto, user: any): Promise<Job> {
        this.logger.log(`Creating job with data: ${JSON.stringify(createJobDto)} for user: ${user.id}`);

        if (!user.companyId) {
            this.logger.error(`User ${user.id} has no companyId. Cannot create job.`);
            throw new BadRequestException('Bạn chưa được gán vào một công ty cụ thể. Vui lòng liên hệ Admin hoặc cập nhật thông tin công ty.');
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Validate Campaigns Ownership
            let linkedCampaigns = [];
            if (createJobDto.campaign_ids && createJobDto.campaign_ids.length > 0) {
                linkedCampaigns = await queryRunner.manager.find(Campaign, {
                    where: { 
                        id: In(createJobDto.campaign_ids),
                        companyId: user.companyId
                    }
                });
                if (linkedCampaigns.length !== createJobDto.campaign_ids.length) {
                    throw new BadRequestException('Một hoặc nhiều chiến dịch không hợp lệ hoặc không thuộc quyền sở hữu của công ty bạn.');
                }
            }

            // Validate Company and check approval status
            const company = await queryRunner.manager.findOne(Company, {
                where: { id: user.companyId }
            });
            if (!company) {
                throw new BadRequestException('Không tìm thấy thông tin công ty tương ứng.');
            }

            // 1. Map DTO Snake Case to Entity Camel Case
            const jobData: any = {
                title: createJobDto.title,
                description: createJobDto.description,
                companyId: user.companyId,
                categoryId: null, // Will be set below
                quantity: createJobDto.quantity || 1,
                minSalary: createJobDto.salary_min,
                maxSalary: createJobDto.salary_max,
                workLocation: createJobDto.work_location,
                type: createJobDto.type,
                positionId: createJobDto.positionId,
                levelId: createJobDto.levelId,
                responsibilities: createJobDto.responsibilities,
                benefits: createJobDto.benefits,
                minExperience: createJobDto.minExperience,
                experienceNote: createJobDto.experienceNote,
                minEducation: createJobDto.minEducation,
                certificates: createJobDto.certificates,
                expiredAt: createJobDto.expired_at ? new Date(createJobDto.expired_at) : null,
                campaigns: linkedCampaigns,
                status: company.status === 'APPROVED' ? (createJobDto.status || 'ACTIVE') : 'DRAFT',
            };

            // 0. Handle Category Resolution
            if (createJobDto.category_id) {
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(createJobDto.category_id);
                if (isUuid) {
                    jobData.categoryId = createJobDto.category_id;
                } else {
                    // Try to find a category with this name for this company or system-wide
                    const category = await queryRunner.manager.findOne(JobCategory, {
                        where: [
                            { name: createJobDto.category_id, company_id: user.companyId },
                            { name: createJobDto.category_id, company_id: 'SYSTEM' } // Fallback for system categories
                        ]
                    });
                    if (category) {
                        jobData.categoryId = category.id;
                    } else {
                        this.logger.warn(`Could not resolve category: ${createJobDto.category_id}. Setting to null.`);
                    }
                }
            }

            this.logger.log(`Mapped job data: ${JSON.stringify(jobData)}`);

            // Link Question Sets (with Snapshotting)
            if (createJobDto.question_set_ids && createJobDto.question_set_ids.length > 0) {
                const snapshotIds = [];
                for (const originalId of createJobDto.question_set_ids) {
                    try {
                        const snapshotId = await this.questionBankService.cloneSetForJob(originalId);
                        snapshotIds.push(snapshotId);
                    } catch (error) {
                        this.logger.error(`Failed to clone question set ${originalId}: ${error.message}`);
                    }
                }
                jobData.questionSets = snapshotIds.map(id => ({ id }));
            }

            const newJob: Job = this.jobRepository.create(jobData as DeepPartial<Job>);
            const savedJob: Job = await queryRunner.manager.save(newJob);

            // 2. Handle Skills if provided
            if (createJobDto.skills && createJobDto.skills.length > 0) {
                const jobSkills = createJobDto.skills.map(skillName =>
                    this.jobSkillRepository.create({
                        jobId: savedJob.id,
                        skillName: skillName,
                        isRequired: true
                    })
                );
                await queryRunner.manager.save(jobSkills);
            }

            await queryRunner.commitTransaction();
            this.logger.log(`Job successfully created with ID: ${savedJob.id}`);

            // 3. Trigger AI Indexing in Background
            this.processAIJobIndexing(savedJob).catch(err => {
                this.logger.error(`AI Indexing failed for job ${savedJob.id}: ${err.message}`);
            });

            return savedJob;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Database error during job creation: ${err.message}`, err.stack);
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async findAll(query: any, user?: any) {
        await this.checkExpiredJobs();
        const qb = this.jobRepository.createQueryBuilder('job');
        qb.leftJoinAndSelect('job.company', 'company');
        qb.leftJoinAndSelect('job.skills', 'skills');
        qb.leftJoinAndSelect('job.campaigns', 'campaigns');
        qb.leftJoinAndSelect('job.category', 'category');
        qb.leftJoinAndSelect('job.level', 'level');
        qb.leftJoinAndSelect('job.position', 'position');

        // Add application counts
        qb.loadRelationCountAndMap('job.applicationsCount', 'job.applications');
        qb.loadRelationCountAndMap('job.pendingApplicationsCount', 'job.applications', 'app', (subQb) => 
            subQb.where('app.status NOT IN (:...doneStatuses)', { doneStatuses: ['REJECTED', 'HIRED'] })
        );

        // 1. Basic Filters
        if (query.campaignId) {
            // Filter by specific campaign in the many-to-many relation
            qb.innerJoin('job.campaigns', 'filterCampaign', 'filterCampaign.id = :campaignId', { campaignId: query.campaignId });
        }

        if (query.companyId) {
            qb.andWhere('job.companyId = :companyId', { companyId: query.companyId });
        }

        // 2. Hide closed/draft jobs and jobs of unapproved companies for candidates and public
        if (!user || user.role === 'CANDIDATE') {
            qb.andWhere('job.status = :activeStatus', { activeStatus: 'ACTIVE' });
            qb.andWhere('company.status = :approvedCompanyStatus', { approvedCompanyStatus: 'APPROVED' });
            
            // Show jobs that either have NO campaign or belong to at least one ACTIVE campaign that has started
            const now = new Date();
            qb.leftJoin('job.campaigns', 'activeCampaign')
              .andWhere('(activeCampaign.id IS NULL OR (activeCampaign.status = :activeCampaignStatus AND (activeCampaign.startDate IS NULL OR activeCampaign.startDate <= :now)))', 
                { activeCampaignStatus: 'ACTIVE', now });
        }

        // 2. Exclude applied jobs for the current user
        if (user && user.id && user.role === 'CANDIDATE') {
            const applications = await this.dataSource.getRepository('Application').find({
                where: { candidateId: user.id },
                select: ['jobId']
            });
            
            const appliedJobIds = applications.map(app => (app as any).jobId);
            if (appliedJobIds.length > 0) {
                qb.andWhere('job.id NOT IN (:...appliedJobIds)', { appliedJobIds });
            }
        }

        qb.orderBy('job.createdAt', 'DESC');

        const jobs = await qb.getMany();

        // ⭐ Calculate Similarity Score if user is logged in as candidate
        if (user && user.role === 'CANDIDATE') {
            const candidate = await this.candidateRepository.findOne({
                where: { userId: user.id }
            });
            
            if (candidate) {
                // Get primary CV with vector
                const primaryCv = await this.dataSource.getRepository(CandidateCv).findOne({
                    where: { candidateId: candidate.id, isPrimary: true },
                    select: ['id', 'cvVector']
                });

                if (primaryCv && primaryCv.cvVector) {
                    // We have the vector, now calculate similarity for each job
                    // Note: In a high-scale system, we'd do this in the SQL query itself for sorting.
                    // For now, we'll map it to the results.
                    const jobsWithSimilarity = await Promise.all(jobs.map(async (job: any) => {
                        if (job.jdVector) {
                            try {
                                const query = `SELECT (1 - ($1::vector <=> $2::vector)) as score`;
                                const [result] = await this.dataSource.query(query, [primaryCv.cvVector, job.jdVector]);
                                job.similarity = result.score;
                            } catch (e) {
                                this.logger.error(`Failed to calculate similarity for job ${job.id}: ${e.message}`);
                            }
                        }
                        return job;
                    }));
                    
                    // Optional: Sort by similarity
                    return jobsWithSimilarity.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
                }
            }
        }

        return jobs;
    }

    async findOne(id: string) {
        try {
            // 1. First find the job itself to ensure it exists
            const job = await this.jobRepository.findOne({
                where: { id }
            });

            if (!job) {
                this.logger.warn(`Job with ID ${id} not found in database`);
                throw new NotFoundException(`Job with ID ${id} not found`);
            }

            // 2. Load essential relations manually/separately to avoid query complexity errors
            const fullJob = await this.jobRepository.findOne({
                where: { id },
                relations: [
                    'company', 
                    'skills', 
                    'campaigns', 
                    'level',
                    'position',
                    'applications', 
                    'applications.candidate', 
                    'applications.candidate.candidateProfile',
                    'applications.cv',
                    'applications.interviews', 
                    'applications.offer',
                    'applications.answers',
                    'applications.answers.question',
                    'questionSets',
                    'questionSets.questions',
                    'questionSets.questions.options'
                ]
            });

            if (fullJob && fullJob.applications) {
                fullJob.applications.forEach((app: any) => {
                    if (app.cvSnapshot) app.cv = app.cvSnapshot;
                });
            }

            return fullJob;
        } catch (error) {
            this.logger.error(`Error in findOne for Job ${id}: ${error.message}`);
            if (error instanceof NotFoundException) throw error;
            throw new BadRequestException(`Lỗi hệ thống khi tải công việc: ${error.message}`);
        }
    }

    async update(id: string, updateJobDto: UpdateJobDto) {
        // 1. Fetch job with essential relations
        const job = await this.jobRepository.findOne({
            where: { id },
            relations: ['applications', 'campaigns', 'questionSets']
        });

        if (!job) {
            throw new NotFoundException(`Job with ID ${id} not found`);
        }

        // 2. Check for applications if updating content
        const applicationCount = job.applications?.length || 0;
        if (applicationCount > 0) {
            const contentFields = [
                'title', 'description', 'category_id', 'work_location', 'salary_min', 
                'salary_max', 'type', 'quantity', 'positionId', 'levelId', 
                'responsibilities', 'benefits', 'minExperience', 'experienceNote', 
                'minEducation', 'certificates', 'campaign_ids', 'question_set_ids'
            ];

            const isUpdatingContent = Object.keys(updateJobDto).some(key => contentFields.includes(key));

            if (isUpdatingContent) {
                this.logger.warn(`Attempted to edit job ${id} which already has ${applicationCount} applications.`);
                throw new BadRequestException('Không thể chỉnh sửa thông tin cốt lõi của công việc khi đã có ứng viên ứng tuyển. Vui lòng đóng tin này và tạo tin mới nếu cần thay đổi lớn.');
            }
        }

        // 3. Map simple fields
        if (updateJobDto.title) job.title = updateJobDto.title;
        if (updateJobDto.description) job.description = updateJobDto.description;
        
        // Category Resolution (Handle 'BE', 'FE' etc. mapping to UUID)
        if (updateJobDto.category_id) {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(updateJobDto.category_id);
            
            const category = await this.dataSource.getRepository(JobCategory).findOne({
                where: isUuid 
                    ? { id: updateJobDto.category_id }
                    : { name: updateJobDto.category_id, company_id: 'SYSTEM' }
            });
            
            if (category) {
                job.categoryId = category.id;
            } else {
                this.logger.warn(`Could not resolve category: ${updateJobDto.category_id} for update.`);
            }
        }

        if (updateJobDto.work_location) job.workLocation = updateJobDto.work_location;
        if (updateJobDto.salary_min) job.minSalary = updateJobDto.salary_min;
        if (updateJobDto.salary_max) job.maxSalary = updateJobDto.salary_max;
        if (updateJobDto.type) job.type = updateJobDto.type;
        if (updateJobDto.quantity !== undefined) job.quantity = updateJobDto.quantity;
        if (updateJobDto.positionId) job.positionId = updateJobDto.positionId;
        if (updateJobDto.levelId) job.levelId = updateJobDto.levelId;
        if (updateJobDto.responsibilities) job.responsibilities = updateJobDto.responsibilities;
        if (updateJobDto.benefits) job.benefits = updateJobDto.benefits;
        if (updateJobDto.minExperience !== undefined) job.minExperience = updateJobDto.minExperience;
        if (updateJobDto.experienceNote) job.experienceNote = updateJobDto.experienceNote;
        if (updateJobDto.minEducation) job.minEducation = updateJobDto.minEducation;
        if (updateJobDto.certificates) job.certificates = updateJobDto.certificates;
        if (updateJobDto.expired_at) job.expiredAt = new Date(updateJobDto.expired_at);
        if (updateJobDto.status) {
            if (updateJobDto.status === 'ACTIVE') {
                const company = await this.dataSource.getRepository(Company).findOne({
                    where: { id: job.companyId }
                });
                if (!company || company.status !== 'APPROVED') {
                    throw new BadRequestException('Tài khoản doanh nghiệp chưa được duyệt. Không thể đăng công khai tin tuyển dụng.');
                }
            }
            job.status = updateJobDto.status;
        }

        // 4. Handle Campaigns Relation
        if (updateJobDto.campaign_ids && Array.isArray(updateJobDto.campaign_ids)) {
            const linkedCampaigns = await this.dataSource.getRepository(Campaign).find({
                where: { id: In(updateJobDto.campaign_ids) }
            });
            job.campaigns = linkedCampaigns;
        }

        // 5. Handle Question Sets updates with Snapshotting
        if (updateJobDto.question_set_ids && Array.isArray(updateJobDto.question_set_ids)) {
            const existingSnapshotIds = job.questionSets ? job.questionSets.map(s => s.id) : [];
            const newSnapshotIds = [...existingSnapshotIds];

            for (const setId of updateJobDto.question_set_ids) {
                if (!existingSnapshotIds.includes(setId)) {
                    try {
                        const sourceSet = await this.questionBankService.findSetOne(setId);
                        if (sourceSet.category !== 'JOB_SNAPSHOT') {
                            const snapshotId = await this.questionBankService.cloneSetForJob(setId);
                            newSnapshotIds.push(snapshotId);
                        } else {
                            newSnapshotIds.push(setId);
                        }
                    } catch (e) {
                        this.logger.error(`Failed to handle question set update for ${setId}: ${e.message}`);
                    }
                }
            }
            const uniqueSnapshotIds = [...new Set(newSnapshotIds)];
            job.questionSets = uniqueSnapshotIds.map(id => ({ id } as any));
        }

        // 6. Save once
        const updatedJob = await this.jobRepository.save(job);

        // 7. Trigger AI Indexing in Background
        if (updateJobDto.description || updateJobDto.title) {
            this.processAIJobIndexing(updatedJob).catch(err => {
                this.logger.error(`AI Re-indexing failed for job ${id}: ${err.message}`);
            });
        }

        return this.findOne(id);
    }

    async triggerIndexing(id: string) {
        const job = await this.findOne(id);
        return this.processAIJobIndexing(job);
    }

    async remove(id: string, companyId?: string) {
        const job = await this.findOne(id);

        // Security check: only owner company (or admin if companyId is not provided) can remove
        if (companyId && job.companyId !== companyId) {
            throw new BadRequestException('Bạn không có quyền xóa công việc này.');
        }

        await this.jobRepository.remove(job);
        return { status: 'success' };
    }

    private async processAIJobIndexing(job: Job) {
        this.logger.log(`Starting AI Analysis for Job: ${job.title}`);

        try {
            const analysis = await this.aiService.analyzeJobDescription(job.description);

            const contextToEmbed = `
          Title: ${job.title}
          Description: ${job.description}
          Responsibilities: ${job.responsibilities || ''}
          Benefits: ${job.benefits || ''}
          Location: ${job.workLocation || ''}
          Category: ${job.categoryId || ''}
          Skills: ${analysis.skills.join(', ')}
          Requirements: ${analysis.keyRequirements}
        `;

            const vector = await this.embeddingService.generateEmbedding(contextToEmbed);
            const vectorStr = `[${vector.join(',')}]`;

            // 1. Update direct column in jobs table
            await this.jobRepository.update(job.id, {
                jdVector: vectorStr
            } as any);

            // 2. ⭐ Also save to centralized vector_storage table
            await this.vectorSearchService.saveVector({
                refId: job.id,
                refType: 'JOB',
                contentType: 'JD_FULL',
                rawContent: contextToEmbed,
                embedding: vector
            });

            this.logger.log(`AI Analysis & Vector Indexing complete for Job: ${job.id}`);
            
            // ⭐ 4. Notify matching candidates
            await this.notifyMatchingCandidates(job, vectorStr);
        } catch (error) {
            this.logger.error(`Indexing process failed: ${error.message}`);
        }
    }

    private async notifyMatchingCandidates(job: Job, jobVector: string) {
        this.logger.log(`Scanning for candidates matching job: ${job.title}`);
        try {
            // Find candidates with similarity > 0.7
            const query = `
                SELECT c.user_id, (1 - (c.cv_vector <=> $1::vector)) as similarity
                FROM candidate_cvs c
                WHERE c.cv_vector IS NOT NULL
                AND (1 - (c.cv_vector <=> $1::vector)) > 0.7
                LIMIT 50
            `;
            const matches = await this.dataSource.query(query, [jobVector]);
            this.logger.log(`Found ${matches.length} potential candidates for recommendation.`);

            for (const match of matches) {
                const candidate = await this.candidateRepository.findOne({ 
                    where: { userId: match.user_id } 
                });

                if (candidate && candidate.notificationPreferences?.jobRecommendations !== false) {
                    await this.notificationService.create({
                        receiverId: match.user_id,
                        title: 'Việc làm phù hợp cho bạn',
                        content: `Chúng tôi tìm thấy công việc "${job.title}" rất phù hợp với kỹ năng của bạn. Hãy ứng tuyển ngay!`,
                        type: 'JOB_RECOMMENDATION' as any,
                        metadata: { jobId: job.id, score: Math.round(match.similarity * 100) }
                    } as any);
                }
            }
        } catch (e) {
            this.logger.error(`Recommendation notify failed: ${e.message}`);
        }
    }

    async getHistory(companyId: string) {
        const jobs = await this.jobRepository.find({
            where: { companyId },
            select: ['title', 'description', 'responsibilities', 'benefits', 'workLocation', 'type'],
            order: { createdAt: 'DESC' },
            take: 50
        });

        // Unique by title and description to provide variety
        const history = {
            titles: [...new Set(jobs.map(j => j.title))],
            descriptions: [...new Set(jobs.map(j => j.description))],
            responsibilities: [...new Set(jobs.filter(j => j.responsibilities).map(j => j.responsibilities))],
            benefits: [...new Set(jobs.filter(j => j.benefits).map(j => j.benefits))],
            locations: [...new Set(jobs.filter(j => j.workLocation).map(j => j.workLocation))]
        };

        return history;
    }

    private async checkExpiredJobs() {
        try {
            const res = await this.jobRepository.createQueryBuilder()
                .update(Job)
                .set({ status: 'CLOSED' })
                .where('expiredAt < NOW()')
                .andWhere('status != :closed', { closed: 'CLOSED' })
                .execute();
            if (res.affected > 0) {
                this.logger.log(`Auto-closed ${res.affected} expired jobs.`);
            }
        } catch (e) {
            this.logger.error(`Failed to auto-close expired jobs: ${e.message}`);
        }
    }
}
