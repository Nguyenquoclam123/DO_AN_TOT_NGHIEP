import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not, IsNull } from 'typeorm';
import { Application } from './entities/application.entity';
import { Job } from '../job/entities/job.entity';
import { CandidateCv } from '../cv/entities/candidate-cv.entity';
import { PromptService } from '../../ai-engine/prompt-engineering/prompt.service';
import { AIService } from '../../ai-engine/ai.service';
import { EmbeddingService } from '../../ai-engine/embedding/embedding.service';
import { VectorSearchService } from '../../ai-engine/vector-search/vector-search.service';
import { NotificationService } from '../notification/notification.service';
import { User } from '../../modules/user/entities/user.entity';
import { Candidate } from '../candidate/entities/candidate.entity';
import { ApplicationStatusHistory } from './entities/application-status-history.entity';

@Injectable()
export class ApplicationService {
    private readonly logger = new Logger(ApplicationService.name);

    constructor(
        @InjectRepository(Application)
        private readonly applicationRepository: Repository<Application>,
        @InjectRepository(Job)
        private readonly jobRepository: Repository<Job>,
        @InjectRepository(CandidateCv)
        private readonly cvRepository: Repository<CandidateCv>,
        private readonly promptService: PromptService,
        private readonly aiService: AIService,
        private readonly embeddingService: EmbeddingService,
        private readonly vectorSearchService: VectorSearchService,
        private readonly notificationService: NotificationService,
        @InjectRepository(Candidate)
        private readonly candidateRepository: Repository<Candidate>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(ApplicationStatusHistory)
        private readonly statusHistoryRepository: Repository<ApplicationStatusHistory>,
        private readonly dataSource: DataSource,
    ) { }

    public async recordStatusHistory(
        applicationId: string, 
        status: string, 
        note?: string, 
        payload?: any,
        actorId?: string,
        actorRole?: string,
        actionType?: string
    ) {
        try {
            await this.statusHistoryRepository.save({
                applicationId,
                status,
                note,
                payload,
                actorId,
                actorRole,
                actionType: actionType || 'STATUS_CHANGE'
            });
        } catch (error) {
            this.logger.error(`Failed to record status history for ${applicationId}: ${error.message}`);
        }
    }
    
    private async notifyStakeholders(applicationId: string, status: string) {
        try {
            const app = await this.applicationRepository.findOne({
                where: { id: applicationId },
                relations: ['job']
            });
            if (!app) return;

            const userIds = new Set<string>();
            userIds.add(app.candidateId);

            const companyId = app.job?.companyId;
            if (companyId) {
                const employers = await this.userRepository.find({
                    where: { companyId, role: 'EMPLOYER' }
                });
                employers.forEach(emp => userIds.add(emp.id));
            }

            await this.notificationService.notifyMultipleUsers(Array.from(userIds), applicationId, status);
        } catch (e) {
            this.logger.error(`Failed to notify stakeholders for app ${applicationId}: ${e.message}`);
        }
    }

    async findAll(): Promise<Application[]> {
        return await this.applicationRepository.find({
            relations: ['candidate', 'job', 'cv', 'answers', 'answers.question', 'answers.question.options'],
            order: { createdAt: 'DESC' }
        });
    }

    private async shouldSendNotification(userId: string, type: 'jobRecommendations' | 'applicationStatus' | 'nexusAiTips' | 'marketingPromo'): Promise<boolean> {
        try {
            const candidate = await this.dataSource.getRepository('Candidate').findOne({ where: { userId } }) as any;
            if (!candidate || !candidate.notificationPreferences) return true; // Default to true if not set
            return candidate.notificationPreferences[type] !== false;
        } catch (e) {
            return true; // Fallback to true
        }
    }

    async create(createDto: { jobId: string; candidateId: string; cvId: string; answers?: any[] }) {
        const { jobId, candidateId, cvId, answers = [] } = createDto;

        const job = await this.jobRepository.findOne({ 
            where: { id: jobId }, 
            select: ['id', 'title', 'description', 'jdVector', 'companyId'] 
        });
        if (!job) throw new NotFoundException('Job not found');

        const fullCv = await this.cvRepository.findOne({ 
            where: { id: cvId },
            relations: ['experiences', 'educations', 'skills', 'projects', 'certifications']
        });
        if (!fullCv) throw new NotFoundException('CV not found');

        // Fetch candidate info from User entity for snapshot immutability
        const user = await this.userRepository.findOne({ where: { id: candidateId } });
        if (user) {
            (fullCv as any).candidateInfo = {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            };
            
            // Also try to get phone from candidate profile if available
            const profile = await this.candidateRepository.findOne({ where: { userId: candidateId } });
            if (profile) {
                (fullCv as any).candidateInfo.phone = profile.phone;
                (fullCv as any).candidateInfo.fullName = profile.fullName;
            }
        }

        const application = this.applicationRepository.create({
            jobId,
            candidateId,
            cvId,
            cvSnapshot: JSON.parse(JSON.stringify(fullCv)),
            status: 'APPLIED',
            score: 0,
            answers: answers.map(ans => ({
                questionId: ans.questionId,
                selectedOptionId: ans.selectedOptionId,
                selectedOptionIds: ans.selectedOptionIds,
                textAnswer: ans.textAnswer
            }))
        });

        const savedApp = await this.applicationRepository.save(application);

        // Record history snapshot with actor info
        await this.recordStatusHistory(
            savedApp.id, 
            'APPLIED', 
            'Ứng tuyển thành công', 
            null, 
            candidateId, 
            'CANDIDATE', 
            'INITIAL_APPLICATION'
        );

        this.logger.log(`Created application ${savedApp.id}. Job vectors: ${!!job.jdVector}, CV vectors: ${!!fullCv.cvVector}`);

        // Notification to Company Employers
        try {
            const candidateUser = await this.userRepository.findOne({ where: { id: candidateId } });
            const candidateName = candidateUser ? `${candidateUser.firstName} ${candidateUser.lastName}` : 'Một ứng viên mới';
            
            const employers = await this.userRepository.find({
                where: { companyId: job.companyId, role: 'EMPLOYER' }
            });

            for (const employer of employers) {
                await this.notificationService.create({
                    receiverId: employer.id,
                    title: 'Ứng tuyển mới',
                    content: `${candidateName} đã ứng tuyển vào vị trí "${job.title}".`,
                    type: 'NEW_APPLICATION' as any,
                    metadata: { applicationId: savedApp.id, jobId: job.id }
                } as any);
            }
            this.logger.log(`Sent notifications to ${employers.length} employers for job ${job.id}`);

            // Notification to Candidate
            await this.notificationService.create({
                receiverId: candidateId,
                title: 'Ứng tuyển thành công',
                content: `Bạn đã ứng tuyển thành công vào vị trí "${job.title}". Chúng tôi sẽ thông báo cho bạn khi có cập nhật mới.`,
                type: 'APPLICATION_STATUS' as any,
                metadata: { applicationId: savedApp.id }
            } as any);
        } catch (error) {
            this.logger.error(`Failed to send notifications for app ${savedApp.id}: ${error.message}`);
        }
        // 1. Calculate matching score
        if (job.jdVector && fullCv.cvVector) {
            this.logger.log(`Triggering vector score calculation for app ${savedApp.id}`);
            this.calculateAndStoreMatchScore(savedApp.id, job.jdVector, fullCv.cvVector).catch(err => {
                this.logger.error(`AI Scoring failed for app ${savedApp.id}: ${err.message}`, err.stack);
            });
        } else {
            this.logger.warn(`Skipping vector score calculation for app ${savedApp.id} - missing vectors (Job: ${!!job.jdVector}, CV: ${!!fullCv.cvVector})`);
        }

        // 2. Generate report in background
        this.logger.log(`Triggering AI Deep Report for app ${savedApp.id}...`);
        this.generateAIReport(savedApp.id).catch(err => {
            this.logger.error(`AI Deep Report failed for app ${savedApp.id}: ${err.message}`, err.stack);
        });

        return savedApp;
    }

    async generateAIReport(applicationId: string) {
        const app = await this.applicationRepository.findOne({
            where: { id: applicationId },
            relations: ['job', 'cv', 'cv.experiences', 'cv.skills', 'answers', 'answers.question', 'answers.question.options']
        });

        if (!app || !app.job) {
            throw new NotFoundException('Content missing for analysis');
        }

        // Use snapshot if available, otherwise fallback to current CV relation
        const targetCv = app.cvSnapshot || app.cv;
        if (!targetCv) {
            throw new NotFoundException('CV missing for analysis');
        }

        // recalculate vector score if zero and vectors exist
        if ((!app.score || app.score === 0) && app.job.jdVector && targetCv.cvVector) {
            await this.calculateAndStoreMatchScore(app.id, app.job.jdVector, targetCv.cvVector);
        }

        try {
            // Use full CV context for better deep analysis
            const cvContext = `
                Summary: ${targetCv.summary || ''}
                Experience: ${targetCv.experiences?.map((e: any) => `${e.position} at ${e.companyName}: ${e.description}`).join('; ')}
                Skills: ${targetCv.skills?.map((s: any) => `${s.name} (${s.level})`).join(', ')}
            `;

            // Incorporate Candidate's Answers into context for better analysis
            let answersContext = '';
            if (app.answers && app.answers.length > 0) {
                answersContext = `\nScreening Questions & Candidate Answers:\n` + 
                    app.answers.map((a: any) => {
                        const question = a.question?.content || 'Question';
                        const type = a.question?.type || 'Unknown';
                        let answer = a.textAnswer || 'No response';
                        
                        // Enhanced answer context with correctness for AI analysis
                        if (a.selectedOptionId && a.question?.options) {
                            const opt = a.question.options.find((o: any) => o.id === a.selectedOptionId);
                            if (opt) {
                                answer = `${opt.optionText} [${opt.isCorrect ? 'CORRECT' : 'INCORRECT'}]`;
                            }
                        } else if (a.selectedOptionIds && a.question?.options) {
                            const opts = a.question.options.filter((o: any) => a.selectedOptionIds.includes(o.id));
                            if (opts.length > 0) {
                                const texts = opts.map((o: any) => `${o.optionText} [${o.isCorrect ? 'CORRECT' : 'INCORRECT'}]`);
                                answer = texts.join(', ');
                            }
                        }
                        
                        return `[${type}] Q: ${question}\nA: ${answer}`;
                    }).join('\n---\n');
            }

            const combinedContext = `${cvContext}\n${answersContext}`;

            const aiResult = await this.promptService.scoreCvAgainstJob(
                app.job.description,
                combinedContext
            );

            await this.applicationRepository.update(applicationId, {
                score: aiResult.overallScore,
                aiReport: aiResult as any
            });

            // ⭐ Send Nexus AI Tip if enabled
            const canSendTip = await this.shouldSendNotification(app.candidateId, 'nexusAiTips');
            if (canSendTip && aiResult.weaknesses?.length > 0) {
                try {
                    await this.notificationService.create({
                        receiverId: app.candidateId,
                        title: 'Mẹo tối ưu hồ sơ từ Nexus AI',
                        content: `Dựa trên phân tích cho vị trí "${app.job?.title}", bạn có thể cải thiện cơ hội bằng cách tập trung vào: ${aiResult.weaknesses[0]}.`,
                        type: 'NEXUS_AI_TIP' as any,
                        metadata: { applicationId, tip: aiResult.weaknesses[0] }
                    } as any);
                } catch (e) {
                    this.logger.error(`Failed to send AI tip: ${e.message}`);
                }
            }

            return aiResult;
        } catch (error) {
            this.logger.error(`Failed to generate AI Report: ${error.message}`);
            throw error;
        }
    }

    async getTalentPool(companyId: string) {
        return await this.applicationRepository.createQueryBuilder('app')
            .leftJoinAndSelect('app.candidate', 'candidate')
            .leftJoinAndSelect('app.cv', 'cv')
            .leftJoin('app.job', 'job')
            .where('job.company_id = :companyId', { companyId })
            .select(['candidate.id', 'candidate.email', 'candidate.firstName', 'candidate.lastName', 'cv.cvTitle', 'cv.summary', 'MAX(app.score) as topScore'])
            .groupBy('candidate.id, candidate.email, candidate.firstName, candidate.lastName, cv.cvTitle, cv.summary')
            .getRawMany();
    }

    async submitFeedback(id: string, feedback: { aiFeedback: string; aiComment?: string }): Promise<Application> {
        const app = await this.findOne(id);
        app.aiFeedback = feedback.aiFeedback;
        if (feedback.aiComment) app.aiComment = feedback.aiComment;
        return await this.applicationRepository.save(app);
    }

    private async calculateAndStoreMatchScore(appId: string, jobVectorStr: string, cvVectorStr: string) {
        const query = `UPDATE applications SET score = (1 - ($1::vector <=> $2::vector)) * 100 WHERE id = $3`;
        try {
            await this.dataSource.query(query, [jobVectorStr, cvVectorStr, appId]);
            this.logger.log(`Successfully calculated vector score for app ${appId}`);
        } catch (e) {
            this.logger.error(`Vector Score Query Error for app ${appId}: ${e.message}`);
        }
    }

    async findAllByJob(jobId: string, query: any): Promise<[Application[], number]> {
        const { page = 1, limit = 10, status } = query;
        const qb = this.applicationRepository.createQueryBuilder('app')
            .leftJoinAndSelect('app.candidate', 'candidate')
            .leftJoinAndSelect('candidate.candidateProfile', 'profile')
            .leftJoinAndSelect('app.cv', 'cv')
            .where('app.job_id = :jobId', { jobId });

        if (status) qb.andWhere('app.status = :status', { status });

        qb.leftJoinAndSelect('app.answers', 'answers')
            .leftJoinAndSelect('answers.question', 'question')
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('app.score', 'DESC');
            
        const [apps, count] = await qb.getManyAndCount();
        apps.forEach(app => {
            if (app.cvSnapshot) app.cv = app.cvSnapshot;
        });
        return [apps, count];
    }

    async getMyApplications(candidateId: string): Promise<Application[]> {
        const apps = await this.applicationRepository.find({
            where: { candidateId },
            relations: ['job', 'job.company', 'cv', 'answers', 'answers.question'],
            order: { createdAt: 'DESC' }
        });
        apps.forEach(app => {
            if (app.cvSnapshot) app.cv = app.cvSnapshot;
        });
        return apps;
    }

    async requestWithdraw(applicationId: string, reason: string, user?: any) {
        const application = await this.applicationRepository.findOne({
            where: { id: applicationId },
            relations: ['job', 'candidate']
        });
        if (!application) throw new NotFoundException('Application not found');

        application.withdrawReason = reason;
        application.withdrawStatus = 'PENDING';
        await this.applicationRepository.save(application);
        
        // Record history for withdraw request with actor info
        await this.recordStatusHistory(
            applicationId, 
            application.status, 
            reason, 
            {
                type: 'CANDIDATE_RESPONSE',
                confirmation: 'WITHDRAW_REQUESTED'
            },
            user?.id,
            'CANDIDATE',
            'CANDIDATE_RESPONDED'
        );

        // Notify company
        try {
            const employers = await this.userRepository.find({
                where: { companyId: application.job.companyId, role: 'EMPLOYER' }
            });

            const candidateName = `${application.candidate.firstName} ${application.candidate.lastName}`;
            for (const employer of employers) {
                await this.notificationService.create({
                    receiverId: employer.id,
                    title: 'Yêu cầu hủy ứng tuyển',
                    content: `${candidateName} muốn hủy đơn ứng tuyển vào vị trí "${application.job.title}". Lý do: ${reason}`,
                    type: 'WITHDRAW_REQUEST' as any,
                    metadata: { 
                        applicationId: application.id,
                        jobId: application.job.id 
                    }
                } as any);
            }
        } catch (error) {
            this.logger.error(`Failed to notify employers about withdraw request ${applicationId}: ${error.message}`);
        }

        // Notify company stakeholders in real-time
        await this.notifyStakeholders(applicationId, application.status);

        return { message: 'Withdraw request sent' };
    }

    async acceptWithdraw(applicationId: string, user?: any) {
        const application = await this.applicationRepository.findOne({
            where: { id: applicationId },
            relations: ['job', 'candidate']
        });
        if (!application) throw new NotFoundException('Application not found');

        application.withdrawStatus = 'ACCEPTED';
        application.status = 'CANCELLED'; 
        application.rejectionReason = `Ứng viên yêu cầu rút hồ sơ: ${application.withdrawReason}`;
        await this.applicationRepository.save(application);
        await this.recordStatusHistory(
            applicationId, 
            'CANCELLED', 
            application.rejectionReason, 
            null, 
            user?.id, 
            user?.role, 
            'WITHDRAW_ACCEPTED'
        );

        // Notify candidate
        try {
            await this.notificationService.create({
                receiverId: application.candidateId,
                title: 'Đã chấp nhận yêu cầu hủy ứng tuyển',
                content: `Công ty đã chấp nhận yêu cầu hủy đơn ứng tuyển của bạn cho vị trí "${application.job.title}".`,
                type: 'APPLICATION_STATUS' as any,
                metadata: { applicationId: application.id }
            } as any);
        } catch (error) {
            this.logger.error(`Failed to notify candidate about withdraw acceptance ${applicationId}: ${error.message}`);
        }

        // Notify stakeholders in real-time
        await this.notifyStakeholders(applicationId, 'CANCELLED');

        return { message: 'Withdraw accepted' };
    }

    async findByCandidate(candidateId: string) {
        return await this.applicationRepository.find({
            where: { candidateId },
            relations: ['job', 'job.company', 'job.campaigns'],
            order: { createdAt: 'DESC' }
        });
    }

    async findAllByCompany(companyId: string) {
        this.logger.log(`Fetching all applications for company: ${companyId}`);
        
        const apps = await this.applicationRepository.find({
            where: {
                job: { companyId }
            },
            relations: [
                'job', 
                'job.company', 
                'candidate', 
                'cv',
                'answers', 
                'answers.question'
            ],
            order: { createdAt: 'DESC' }
        });

        // Use snapshot if available
        apps.forEach(app => {
            if (app.cvSnapshot) app.cv = app.cvSnapshot;
        });

        return apps;
    }

    async reAnalyzeAll() {
        this.logger.log('Starting manual AI re-analysis for all data (Jobs, CVs, Applications)...');

        // 1. Re-index all Jobs
        const jobs = await this.jobRepository.find();
        for (const job of jobs) {
            try {
                this.logger.log(`Refreshing vector for Job: ${job.id}`);
                const analysis = await this.aiService.analyzeJobDescription(job.description);
                const contextToEmbed = `Title: ${job.title}\nDescription: ${job.description}\nResponsibilities: ${job.responsibilities || ''}\nBenefits: ${job.benefits || ''}\nSkills: ${analysis.skills.join(', ')}\nRequirements: ${analysis.keyRequirements}`;
                const vector = await this.embeddingService.generateEmbedding(contextToEmbed);
                
                // Update jobs table
                await this.jobRepository.update(job.id, { jdVector: `[${vector.join(',')}]` } as any);
                
                // ⭐ Populate vector_storage
                await this.vectorSearchService.saveVector({
                    refId: job.id,
                    refType: 'JOB',
                    contentType: 'JD_REINDEX',
                    rawContent: contextToEmbed,
                    embedding: vector
                });
            } catch (e) {
                this.logger.error(`Failed to index job ${job.id}: ${e.message}`);
            }
        }

        // 2. Re-index all CVs
        const cvs = await this.cvRepository.find({ relations: ['experiences', 'skills'] });
        for (const cv of cvs) {
            try {
                this.logger.log(`Refreshing vector for CV: ${cv.id}`);
                const contextText = `Title: ${cv.cvTitle || ''}\nSummary: ${cv.summary || ''}\nExperiences: ${cv.experiences?.map(e => `${e.position} at ${e.companyName}: ${e.description}`).join('. ')}\nSkills: ${cv.skills?.map(s => s.name).join(', ')}`;
                const vector = await this.embeddingService.generateEmbedding(contextText);
                
                // Update candidate_cvs table
                await this.cvRepository.update(cv.id, { cvVector: `[${vector.join(',')}]` } as any);
                
                // ⭐ Populate vector_storage
                await this.vectorSearchService.saveVector({
                    refId: cv.id,
                    refType: 'CV',
                    contentType: 'CV_REINDEX',
                    rawContent: contextText,
                    embedding: vector
                });
            } catch (e) {
                this.logger.error(`Failed to index CV ${cv.id}: ${e.message}`);
            }
        }

        // 3. Re-analyze all Applications
        const apps = await this.applicationRepository.find({ relations: ['job', 'cv'] });
        for (const app of apps) {
            try {
                // Refresh job/cv data in case we just indexed them
                const freshJob = await this.jobRepository.findOne({ where: { id: app.jobId } });
                const freshCv = await this.cvRepository.findOne({ where: { id: app.cvId } });

                if (freshJob?.jdVector && freshCv?.cvVector) {
                    await this.calculateAndStoreMatchScore(app.id, freshJob.jdVector, freshCv.cvVector);
                }

                await this.generateAIReport(app.id);
                this.logger.log(`Re-analyzed app ${app.id} successfully`);
            } catch (error) {
                this.logger.error(`Failed to re-analyze app ${app.id}: ${error.message}`);
            }
        }
        return { message: 'Re-analysis completed for all Jobs, CVs and Applications' };
    }

    async getFeedbackLogs() {
        return await this.applicationRepository.find({
            where: {
                aiFeedback: Not(IsNull())
            },
            relations: ['candidate', 'job', 'job.company'],
            order: { createdAt: 'DESC' }
        });
    }

    async findOne(id: string, viewer?: any): Promise<Application> {
        this.logger.log(`Fetching application detail: ${id}`);
        
        // Optimize: Fetch application with primary relations first
        const app = await this.applicationRepository.findOne({
            where: { id },
            relations: [
                'job', 
                'job.company', 
                'candidate', 
                'candidate.candidateProfile',
                'cv', 
                'cv.experiences',
                'cv.educations',
                'cv.skills',
                'cv.projects',
                'answers', 
                'answers.question',
                'interviews',
                'offer',
                'statusHistory',
                'statusHistory.actor'
            ]
        });

        if (!app) throw new NotFoundException(`Application ID ${id} not found`);
        
        // Fetch question options separately to avoid massive joins
        if (app.answers && app.answers.length > 0) {
            for (const answer of app.answers) {
                if (answer.question) {
                    answer.question.options = await this.dataSource.getRepository('QuestionOption').find({
                        where: { questionId: answer.question.id }
                    });
                }
            }
        }

        // Use snapshot if available to preserve CV state at time of application
        if (app.cvSnapshot) {
            app.cv = app.cvSnapshot;
        } else if (viewer && viewer.role === 'EMPLOYER' && app.cv) {
            // Backfill snapshot safely for legacy applications
            try {
                this.logger.log(`Backfilling snapshot for legacy application: ${app.id}`);
                
                const snapshot: any = {
                    cvTitle: app.cv.cvTitle,
                    summary: app.cv.summary,
                    experiences: app.cv.experiences || [],
                    educations: app.cv.educations || [],
                    skills: app.cv.skills || [],
                    projects: app.cv.projects || [],
                    certifications: app.cv.certifications || []
                };

                // Add candidate info for immutability
                if (app.candidate) {
                    snapshot.candidateInfo = {
                        firstName: app.candidate.firstName,
                        lastName: app.candidate.lastName,
                        email: app.candidate.email
                    };

                    const profile = await this.candidateRepository.findOne({ where: { userId: app.candidateId } });
                    if (profile) {
                        snapshot.candidateInfo.phone = profile.phone;
                        snapshot.candidateInfo.fullName = profile.fullName;
                    }
                }

                app.cvSnapshot = snapshot;
                await this.applicationRepository.update(app.id, { cvSnapshot: snapshot });
                app.cv = snapshot;
            } catch (e) {
                this.logger.error(`Failed to backfill snapshot for app ${app.id}: ${e.message}`);
            }
        }

        // Track first view by Employer
        if (viewer && viewer.role === 'EMPLOYER' && !app.viewedAt) {
            app.viewedAt = new Date();
            await this.applicationRepository.save(app);

            const canSend = await this.shouldSendNotification(app.candidateId, 'applicationStatus');
            if (canSend) {
                try {
                    await this.notificationService.create({
                        receiverId: app.candidateId,
                        title: 'Hồ sơ đã được xem',
                        content: `Nhà tuyển dụng đã xem hồ sơ của bạn cho vị trí "${app.job?.title}".`,
                        type: 'APPLICATION_STATUS' as any,
                        metadata: { applicationId: id, event: 'VIEWED' }
                    } as any);
                } catch (e) {
                    this.logger.error(`Failed to send view notification: ${e.message}`);
                }
            }
        }

        return app;
    }

    async updateStatus(id: string, status: string, user?: any, rejectionReason?: string, note?: string): Promise<Application> {
        const app = await this.findOne(id);
        const oldStatus = app.status;
        app.status = status;
        if (status === 'REJECTED' && rejectionReason) {
            app.rejectionReason = rejectionReason;
        }
        if (note) {
            app.note = note;
        }
        const savedApp = await this.applicationRepository.save(app);
        await this.recordStatusHistory(
            id, 
            status, 
            note || rejectionReason, 
            null, 
            user?.id, 
            user?.role, 
            'STATUS_CHANGE'
        );

        if (oldStatus !== status) {
            const canSend = await this.shouldSendNotification(app.candidateId, 'applicationStatus');
            if (canSend) {
                try {
                    const jobTitle = app.job?.title || 'vị trí đã ứng tuyển';
                    let content = `Hồ sơ của bạn cho vị trí "${jobTitle}" đã được chuyển sang giai đoạn: ${status}.`;
                    
                    if (status === 'REJECTED' && rejectionReason) {
                        content = `Chúng tôi rất tiếc phải thông báo rằng hồ sơ của bạn cho vị trí "${jobTitle}" đã bị từ chối. Lý do: ${rejectionReason}`;
                    } else if (note) {
                        content += `\n\nGhi chú từ nhà tuyển dụng: ${note}`;
                    }

                    await this.notificationService.create({
                        receiverId: app.candidateId,
                        title: status === 'REJECTED' ? 'Kết quả ứng tuyển' : 'Cập nhật trạng thái ứng tuyển',
                        content,
                        type: 'APPLICATION_STATUS' as any,
                        metadata: { applicationId: id, status, rejectionReason }
                    } as any);

                    // ⭐ Trigger Socket Broadcast for all stakeholders
                    await this.notifyStakeholders(id, status);
                    
                    this.logger.log(`Notification sent to candidate ${app.candidateId} for status change to ${status}`);
                } catch (error) {
                    this.logger.error(`Failed to send notification for app ${id}: ${error.message}`);
                }
            }
        }
        return savedApp;
    }
}
