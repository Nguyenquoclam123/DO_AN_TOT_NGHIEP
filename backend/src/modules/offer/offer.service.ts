import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobOffer } from './entities/offer.entity';
import { CreateOfferDto } from './dto/offer.dto';
import { Application } from '../application/entities/application.entity';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/dto/notification.dto';
import { User } from '../user/entities/user.entity';
import { ApplicationStatusHistory } from '../application/entities/application-status-history.entity';
import { ApplicationService } from '../application/application.service';

@Injectable()
export class OfferService {
    constructor(
        @InjectRepository(JobOffer)
        private readonly offerRepository: Repository<JobOffer>,
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

            const companyId = app.job?.companyId;
            if (companyId) {
                const employers = await this.userRepository.find({
                    where: { companyId, role: 'EMPLOYER' }
                });
                employers.forEach(emp => userIds.add(emp.id));
            }

            await this.notificationService.notifyMultipleUsers(Array.from(userIds), applicationId, status);
        } catch (e) {
            console.error('Failed to notify stakeholders in OfferService', e);
        }
    }

    private async recordOfferHistory(
        applicationId: string, 
        offer: any, 
        note: string,
        actorId?: string,
        actorRole?: string,
        actionType?: string
    ) {
        try {
            await this.applicationService.recordStatusHistory(
                applicationId,
                'OFFER',
                note,
                {
                    type: 'OFFER_SNAPSHOT',
                    salary: offer.salary,
                    startDate: offer.startDate,
                    notes: offer.notes
                },
                actorId,
                actorRole,
                actionType || 'OFFER_SNAPSHOT'
            );
        } catch (e) {
            console.error('Failed to record offer history', e);
        }
    }

    async create(dto: CreateOfferDto, user?: any) {
        console.log(`Creating/Updating offer for application: ${dto.applicationId}`, dto);
        
        try {
            // 1. Check if offer already exists for this application
            let offer = await this.offerRepository.findOne({
                where: { applicationId: dto.applicationId }
            });

            if (offer) {
                console.log(`Updating existing offer ${offer.id}`);
                offer.salary = dto.salary;
                offer.startDate = dto.startDate ? new Date(dto.startDate) : null;
                offer.notes = dto.notes;
                offer.status = 'PENDING';
                offer.candidateFeedback = null;
            } else {
                console.log(`Creating new offer`);
                offer = this.offerRepository.create({
                    applicationId: dto.applicationId,
                    salary: dto.salary,
                    startDate: dto.startDate ? new Date(dto.startDate) : null,
                    notes: dto.notes,
                    status: 'PENDING'
                });
            }

            const savedOffer = await this.offerRepository.save(offer);
            
            // Update Application Status to OFFER
            await this.applicationRepository.update(dto.applicationId, { status: 'OFFER' });

            // Record history snapshot with actor info
            await this.recordOfferHistory(
                dto.applicationId, 
                savedOffer, 
                dto.notes || 'Gửi lời mời làm việc',
                user?.id,
                user?.role,
                'OFFER_CREATED'
            );

            // 2. Send Notification
            try {
                const app = await this.applicationRepository.findOne({
                    where: { id: dto.applicationId },
                    relations: ['job']
                });
                if (app) {
                    await this.notificationService.create({
                        receiverId: app.candidateId,
                        title: 'Lời mời làm việc (Job Offer)',
                        content: `Chúc mừng! Bạn đã nhận được lời mời làm việc cho vị trí "${app.job?.title}". Vui lòng kiểm tra chi tiết và phản hồi.`,
                        type: NotificationType.APPLICATION_STATUS,
                        metadata: { offerId: savedOffer.id, applicationId: app.id }
                    });

                    // ⭐ Trigger Socket Update for Frontend Refresh
                    await this.notificationService.notifyApplicationUpdate(app.candidateId, app.id, app.status);
                    
                    console.log(`Offer notification sent to candidate ${app.candidateId}`);
                }
            } catch (notifyErr) {
                console.error('Failed to send offer notification', notifyErr);
            }

            return savedOffer;
        } catch (err) {
            console.error('Error in OfferService.create:', err);
            throw err;
        }
    }

    async findByApplication(applicationId: string) {
        return await this.offerRepository.findOne({
            where: { applicationId },
            order: { createdAt: 'DESC' }
        });
    }

    async confirm(id: string, confirmation: 'ACCEPTED' | 'REJECTED' | 'NEGOTIATED', user?: any, feedback?: string) {
        const offer = await this.offerRepository.findOne({
            where: { id },
            relations: ['application', 'application.job', 'application.job.company', 'application.candidate']
        });
        if (!offer) throw new NotFoundException('Offer not found');

        offer.status = confirmation;
        if (feedback) {
            offer.candidateFeedback = feedback;
        }
        
        const saved = await this.offerRepository.save(offer);

        // Update Application Status to ensure consistency across dashboards
        const appStatus = confirmation === 'NEGOTIATED' ? 'OFFER_NEGOTIATED' : 'OFFER_CONFIRMED';
        await this.applicationRepository.update(offer.applicationId, { status: appStatus });
        
        // Record history snapshot for candidate response using unified helper
        try {
            await this.applicationService.recordStatusHistory(
                offer.applicationId,
                appStatus,
                feedback || (confirmation === 'ACCEPTED' ? 'Ứng viên chấp nhận Offer' : (confirmation === 'NEGOTIATED' ? 'Ứng viên đề xuất thương lượng Offer' : 'Ứng viên từ chối Offer')),
                {
                    type: 'CANDIDATE_RESPONSE',
                    confirmation,
                    salary: offer.salary,
                    startDate: offer.startDate
                },
                user?.id || offer.application?.candidateId,
                user?.role || 'CANDIDATE',
                'CANDIDATE_RESPONDED'
            );

            // ⭐ Trigger Real-time Broadcast for all stakeholders
            await this.notifyStakeholders(offer.applicationId, appStatus);
        } catch (e) {
            console.error('Failed to record offer confirmation history', e);
        }

        try {
            const companyUserId = offer.application?.job?.company?.userId;
            const candidateName = `${offer.application?.candidate?.firstName || ''} ${offer.application?.candidate?.lastName || ''}`.trim() || 'Ứng viên';
            const jobTitle = offer.application?.job?.title || 'vị trí tuyển dụng';

            if (companyUserId) {
                let title = '';
                let content = '';

                if (confirmation === 'ACCEPTED') {
                    title = 'Ứng viên chấp nhận Offer';
                    content = `Ứng viên ${candidateName} đã CHẤP NHẬN lời mời làm việc cho vị trí "${jobTitle}".`;
                } else if (confirmation === 'REJECTED') {
                    title = 'Ứng viên từ chối Offer';
                    content = `Ứng viên ${candidateName} đã TỪ CHỐI lời mời làm việc cho vị trí "${jobTitle}".`;
                } else if (confirmation === 'NEGOTIATED') {
                    title = 'Yêu cầu thương lượng Offer';
                    content = `Ứng viên ${candidateName} mong muốn thương lượng lại Offer cho vị trí "${jobTitle}". Phản hồi: ${feedback || 'Không có'}`;
                }

                await this.notificationService.create({
                    receiverId: companyUserId,
                    title,
                    content,
                    type: NotificationType.APPLICATION_STATUS,
                    metadata: { offerId: offer.id, applicationId: offer.applicationId, confirmation, feedback }
                });
            }
        } catch (e) {
            console.error('Failed to send offer confirmation notification to employer', e);
        }

        return saved;
    }
}
