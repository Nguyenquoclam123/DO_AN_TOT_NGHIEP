import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/notification.dto';

import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
        private readonly notificationGateway: NotificationGateway,
    ) { }

    async create(dto: CreateNotificationDto) {
        const notification = this.notificationRepository.create({
            ...dto,
            isRead: false
        });
        const saved = await this.notificationRepository.save(notification);
        
        // Push real-time notification
        this.notificationGateway.sendToUser(dto.receiverId, 'NEW_NOTIFICATION', saved);
        
        return saved;
    }

    async notifyApplicationUpdate(userId: string, applicationId: string, status: string) {
        this.notificationGateway.sendToUser(userId, 'APPLICATION_UPDATED', {
            applicationId,
            status,
            timestamp: new Date()
        });
    }

    async notifyMultipleUsers(userIds: string[], applicationId: string, status: string) {
        userIds.forEach(userId => {
            this.notifyApplicationUpdate(userId, applicationId, status);
        });
    }

    async findByReceiver(receiverId: string) {
        return await this.notificationRepository.find({
            where: { receiverId },
            order: { createdAt: 'DESC' }
        });
    }

    async markAsRead(id: string) {
        return await this.notificationRepository.update(id, { isRead: true });
    }

    async markByApplicationId(userId: string, applicationId: string) {
        return await this.notificationRepository
            .createQueryBuilder()
            .update(Notification)
            .set({ isRead: true })
            .where("receiver_id = :userId", { userId })
            .andWhere("is_read = false")
            .andWhere("metadata->>'applicationId' = :applicationId", { applicationId })
            .execute();
    }

    async markAllAsRead(receiverId: string) {
        return await this.notificationRepository.update({ receiverId, isRead: false }, { isRead: true });
    }

    async broadcastMarketing(title: string, content: string, metadata?: any) {
        // Find all candidates who opted in for marketing
        const candidates = await this.notificationRepository.query(`
            SELECT user_id 
            FROM candidates 
            WHERE (notification_preferences->>'marketingPromo')::boolean = true 
               OR notification_preferences IS NULL
        `);

        for (const candidate of candidates) {
            await this.create({
                receiverId: candidate.user_id,
                title,
                content,
                type: 'MARKETING_PROMO' as any,
                metadata
            });
        }
        return { sentCount: candidates.length };
    }
}
