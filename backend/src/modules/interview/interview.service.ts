import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interview } from './entities/interview.entity';
import { ScheduleInterviewDto } from './dto/interview.dto';
import { Application } from '../application/entities/application.entity';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/dto/notification.dto';

import { User } from '../user/entities/user.entity';

import { ApplicationStatusHistory } from '../application/entities/application-status-history.entity';
import { ApplicationService } from '../application/application.service';

@Injectable()
export class InterviewService {
    constructor(
        @InjectRepository(Interview)
        private readonly interviewRepository: Repository<Interview>,
        @InjectRepository(Application)
        private readonly applicationRepository: Repository<Application>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly notificationService: NotificationService,
        private readonly applicationService: ApplicationService,
    ) { }

    private async notifyStakeholders(applicationId: string, status: string) {
        try {
            const app = await this.applicationRepository.findOne({
                where: { id: applicationId },
                relations: ['job', 'job.company']
            });
            if (!app) return;

            const userIds = new Set<string>();
            userIds.add(app.candidateId);

            // Find all employers in the same company
            const companyId = app.job?.companyId;
            if (companyId) {
                const employers = await this.userRepository.find({
                    where: { companyId, role: 'EMPLOYER' }
                });
                employers.forEach(emp => userIds.add(emp.id));
            }

            await this.notificationService.notifyMultipleUsers(Array.from(userIds), applicationId, status);
        } catch (e) {
            console.error('Failed to notify stakeholders', e);
        }
    }

    private async recordInterviewHistory(
        applicationId: string, 
        interview: any, 
        note: string,
        actorId?: string,
        actorRole?: string,
        actionType?: string
    ) {
        try {
            await this.applicationService.recordStatusHistory(
                applicationId,
                'INTERVIEWING',
                note,
                {
                    type: 'INTERVIEW_SNAPSHOT',
                    scheduledAt: interview.scheduledAt,
                    location: interview.location,
                    interviewType: interview.type,
                    notes: interview.notes
                },
                actorId,
                actorRole,
                actionType || 'INTERVIEW_SNAPSHOT'
            );
        } catch (e) {
            console.error('Failed to record interview history', e);
        }
    }

    async schedule(dto: ScheduleInterviewDto, user?: any) {
        const interview = this.interviewRepository.create({
            applicationId: dto.applicationId,
            scheduledAt: new Date(dto.scheduledAt),
            location: dto.location,
            type: dto.type,
            notes: dto.notes,
            status: 'SCHEDULED'
        });
        const savedInterview = await this.interviewRepository.save(interview);
        
        // Update Application Status to INTERVIEWING
        await this.applicationRepository.update(dto.applicationId, { status: 'INTERVIEWING' });

        // Record history snapshot with actor info
        await this.recordInterviewHistory(
            dto.applicationId, 
            savedInterview, 
            'Hẹn lịch phỏng vấn mới',
            user?.id,
            user?.role,
            'INTERVIEW_SCHEDULED'
        );

        // ⭐ Trigger Real-time Broadcast for all stakeholders
        await this.notifyStakeholders(dto.applicationId, 'INTERVIEWING');

        try {
            const app = await this.applicationRepository.findOne({
                where: { id: dto.applicationId },
                relations: ['job']
            });
            if (app) {
                await this.notificationService.create({
                    receiverId: app.candidateId,
                    title: 'Lịch phỏng vấn mới',
                    content: `Bạn có một lịch phỏng vấn cho vị trí "${app.job?.title}" vào lúc ${new Date(dto.scheduledAt).toLocaleString('vi-VN')}. Địa điểm: ${dto.location}`,
                    type: NotificationType.INTERVIEW_SCHEDULE,
                    metadata: { interviewId: savedInterview.id, applicationId: app.id }
                });

                // ⭐ Trigger Socket Update for Frontend Refresh
                await this.notificationService.notifyApplicationUpdate(app.candidateId, app.id, app.status);
            }
        } catch (e) {
            console.error('Failed to send interview notification', e);
        }

        return savedInterview;
    }

    async update(id: string, dto: Partial<ScheduleInterviewDto>, user?: any) {
        const interview = await this.interviewRepository.findOne({ where: { id } });
        if (!interview) throw new NotFoundException('Interview not found');

        if (dto.scheduledAt) interview.scheduledAt = new Date(dto.scheduledAt);
        if (dto.location) interview.location = dto.location;
        if (dto.type) interview.type = dto.type;
        if (dto.notes) interview.notes = dto.notes;
        
        // Reset confirmation and clear old feedback when updated by employer
        interview.candidateConfirmation = 'PENDING';
        interview.candidateFeedback = null;
        interview.status = 'SCHEDULED';

        const saved = await this.interviewRepository.save(interview);

        // Record history snapshot with actor info
        await this.recordInterviewHistory(
            interview.applicationId, 
            saved, 
            dto.notes || 'Nhà tuyển dụng đã cập nhật lại lịch phỏng vấn',
            user?.id,
            user?.role,
            'INTERVIEW_UPDATED'
        );

        // Ensure application status reflects the active interviewing stage
        await this.applicationRepository.update(interview.applicationId, { status: 'INTERVIEWING' });

        // ⭐ Trigger Real-time Broadcast for all stakeholders
        await this.notifyStakeholders(interview.applicationId, 'INTERVIEWING');

        try {
            const app = await this.applicationRepository.findOne({
                where: { id: interview.applicationId },
                relations: ['job']
            });
            if (app) {
                await this.notificationService.create({
                    receiverId: app.candidateId,
                    title: 'Lịch phỏng vấn đã được cập nhật',
                    content: `Lịch phỏng vấn cho vị trí "${app.job?.title}" đã được thay đổi. Thời gian mới: ${new Date(saved.scheduledAt).toLocaleString('vi-VN')}. Địa điểm: ${saved.location}`,
                    type: NotificationType.INTERVIEW_SCHEDULE,
                    metadata: { interviewId: saved.id, applicationId: app.id }
                });
            }
        } catch (e) {
            console.error('Failed to send updated interview notification', e);
        }

        return saved;
    }

    async findByApplication(applicationId: string) {
        return await this.interviewRepository.find({
            where: { applicationId },
            order: { scheduledAt: 'DESC' }
        });
    }

    async updateStatus(id: string, status: string) {
        const interview = await this.interviewRepository.findOne({ where: { id } });
        if (!interview) throw new NotFoundException('Interview not found');
        interview.status = status;
        return await this.interviewRepository.save(interview);
    }

    async confirmInterview(id: string, confirmation: 'ACCEPTED' | 'REJECTED' | 'RESCHEDULE_REQUESTED', user?: any, feedback?: string) {
        const interview = await this.interviewRepository.findOne({ 
            where: { id },
            relations: ['application', 'application.job', 'application.job.company', 'application.candidate']
        });
        if (!interview) throw new NotFoundException('Interview not found');
        
        interview.candidateConfirmation = confirmation;
        if (feedback) {
            interview.candidateFeedback = feedback;
        }
        const saved = await this.interviewRepository.save(interview);

        // Update Application Status to ensure consistency across dashboards
        const appStatus = confirmation === 'RESCHEDULE_REQUESTED' ? 'RESCHEDULE_REQUESTED' : 'INTERVIEW_CONFIRMED';
        await this.applicationRepository.update(interview.applicationId, { status: appStatus });

        // Record history snapshot for candidate response using unified helper
        try {
            await this.applicationService.recordStatusHistory(
                interview.applicationId,
                appStatus,
                feedback || (confirmation === 'ACCEPTED' ? 'Ứng viên chấp nhận phỏng vấn' : (confirmation === 'RESCHEDULE_REQUESTED' ? 'Ứng viên yêu cầu dời lịch' : 'Ứng viên từ chối phỏng vấn')),
                {
                    type: 'CANDIDATE_RESPONSE',
                    confirmation,
                    // Preserve snapshot at time of response
                    scheduledAt: interview.scheduledAt,
                    location: interview.location,
                    interviewType: interview.type
                },
                user?.id || interview.application?.candidateId,
                user?.role || 'CANDIDATE',
                'CANDIDATE_RESPONDED'
            );
        } catch (e) {
            console.error('Failed to record interview confirmation history', e);
        }

        // ⭐ Trigger Real-time Broadcast for all stakeholders
        await this.notifyStakeholders(interview.applicationId, confirmation === 'RESCHEDULE_REQUESTED' ? 'RESCHEDULE_REQUESTED' : 'INTERVIEW_CONFIRMED');

        try {
            const companyUserId = interview.application?.job?.company?.userId;
            const candidateName = `${interview.application?.candidate?.firstName || ''} ${interview.application?.candidate?.lastName || ''}`.trim() || 'Ứng viên';
            const jobTitle = interview.application?.job?.title || 'vị trí tuyển dụng';

            if (companyUserId) {
                let title = '';
                let content = '';

                if (confirmation === 'ACCEPTED') {
                    title = 'Ứng viên chấp nhận phỏng vấn';
                    content = `Ứng viên ${candidateName} đã CHẤP NHẬN lịch phỏng vấn cho vị trí "${jobTitle}".`;
                } else if (confirmation === 'REJECTED') {
                    title = 'Ứng viên từ chối phỏng vấn';
                    content = `Ứng viên ${candidateName} đã TỪ CHỐI lịch phỏng vấn cho vị trí "${jobTitle}".`;
                } else if (confirmation === 'RESCHEDULE_REQUESTED') {
                    title = 'Yêu cầu dời lịch phỏng vấn';
                    content = `Ứng viên ${candidateName} mong muốn dời lịch phỏng vấn cho vị trí "${jobTitle}". Ghi chú: ${feedback || 'Không có'}`;
                }

                await this.notificationService.create({
                    receiverId: companyUserId,
                    title,
                    content,
                    type: NotificationType.INTERVIEW_SCHEDULE,
                    metadata: { interviewId: interview.id, applicationId: interview.applicationId, confirmation, feedback }
                });
            }
        } catch (e) {
            console.error('Failed to send interview confirmation notification to employer', e);
        }

        return saved;
    }
}
