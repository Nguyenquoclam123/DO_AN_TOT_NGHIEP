import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DataSource, Not } from 'typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { Message } from './entities/message.entity';
import { SendMessageDto, CreateChatRoomDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);

    constructor(
        @InjectRepository(ChatRoom)
        private readonly chatRoomRepository: Repository<ChatRoom>,
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
        private readonly dataSource: DataSource,
    ) { }

    async getRoomById(id: string) {
        return await this.chatRoomRepository.findOne({ where: { id } });
    }

    async createRoom(dto: CreateChatRoomDto) {
        const room = this.chatRoomRepository.create({
            applicationId: dto.applicationId,
            jobId: dto.jobId,
            candidateId: dto.candidateId,
            companyId: dto.companyId,
            status: 'ACTIVE'
        });
        return await this.chatRoomRepository.save(room);
    }

    async findOrCreateRoom(dto: CreateChatRoomDto) {
        this.logger.log(`FindOrCreateRoom requested: ${JSON.stringify(dto)}`);
        let room;
        
        let effectiveApplicationId = dto.applicationId;
        let effectiveJobId = dto.jobId;

        // 1. If we have a candidate and job, try to find an active application
        if (!effectiveApplicationId && effectiveJobId && dto.candidateId) {
            const application = await this.dataSource.getRepository('applications').findOne({
                where: { 
                    jobId: effectiveJobId,
                    candidateId: dto.candidateId,
                    status: Not('REJECTED')
                }
            }) as any;
            if (application) {
                this.logger.log(`Found linked application ${application.id} for job ${effectiveJobId}`);
                effectiveApplicationId = application.id;
            }
        }

        // 2. If we have an application but no jobId, get jobId from application
        if (effectiveApplicationId && !effectiveJobId) {
            const application = await this.dataSource.getRepository('applications').findOne({
                where: { id: effectiveApplicationId },
                select: ['jobId']
            }) as any;
            if (application) {
                this.logger.log(`Found job ${application.jobId} for application ${effectiveApplicationId}`);
                effectiveJobId = application.jobId;
            }
        }

        // 3. Try to find room by applicationId
        if (effectiveApplicationId) {
            room = await this.chatRoomRepository.findOne({
                where: { applicationId: effectiveApplicationId },
                relations: ['job', 'company', 'candidate']
            });
            if (room) this.logger.log(`Found existing room ${room.id} by applicationId`);
        }

        // 4. If not found, try to find room by jobId (without applicationId)
        if (!room && effectiveJobId) {
            room = await this.chatRoomRepository.findOne({
                where: { 
                    candidateId: dto.candidateId,
                    companyId: dto.companyId,
                    jobId: effectiveJobId,
                    applicationId: IsNull()
                },
                relations: ['job', 'company', 'candidate']
            });
            if (room) this.logger.log(`Found existing room ${room.id} by jobId (General for Job)`);
        }

        // 5. If not found, try to find room without jobId/applicationId (General for Company)
        if (!room && !effectiveJobId && !effectiveApplicationId) {
            room = await this.chatRoomRepository.findOne({
                where: { 
                    candidateId: dto.candidateId,
                    companyId: dto.companyId,
                    jobId: IsNull(),
                    applicationId: IsNull()
                },
                relations: ['job', 'company', 'candidate']
            });
            if (room) this.logger.log(`Found existing room ${room.id} by Company (General Inquiry)`);
        }

        // 6. Update room if it exists but is missing metadata we now have
        if (room) {
            let needsUpdate = false;
            if (effectiveApplicationId && !room.applicationId) {
                this.logger.log(`Updating room ${room.id} with applicationId ${effectiveApplicationId}`);
                room.applicationId = effectiveApplicationId;
                needsUpdate = true;
            }
            if (effectiveJobId && !room.jobId) {
                this.logger.log(`Updating room ${room.id} with jobId ${effectiveJobId}`);
                room.jobId = effectiveJobId;
                needsUpdate = true;
            }
            if (needsUpdate) {
                await this.chatRoomRepository.save(room);
                room = await this.chatRoomRepository.findOne({
                    where: { id: room.id },
                    relations: ['job', 'company', 'candidate']
                });
            }
        }

        // 7. Create if still not found
        if (!room) {
            this.logger.log(`Creating new chat room for Application: ${effectiveApplicationId}, Job: ${effectiveJobId}`);
            const newRoomData: any = {
                candidateId: dto.candidateId,
                companyId: dto.companyId,
                jobId: effectiveJobId,
                applicationId: effectiveApplicationId,
                status: 'ACTIVE'
            };
            const newRoom = this.chatRoomRepository.create(newRoomData);
            const savedRoom = await this.chatRoomRepository.save(newRoom);
            room = await this.chatRoomRepository.findOne({
                where: { id: (savedRoom as any).id },
                relations: ['job', 'company', 'candidate']
            });
        }
        return room;
    }

    async sendMessage(senderId: string, dto: SendMessageDto) {
        const message = this.messageRepository.create({
            roomId: dto.roomId,
            senderId,
            messageText: dto.messageText,
            attachmentUrl: dto.attachmentUrl
        });
        const savedMessage = await this.messageRepository.save(message);
        return await this.messageRepository.findOne({
            where: { id: savedMessage.id },
            relations: ['sender']
        });
    }

    async getMessagesByRoom(roomId: string) {
        return await this.messageRepository.find({
            where: { roomId },
            order: { createdAt: 'ASC' }
        });
    }

    async getMyRooms(userId: string, role: string) {
        const query = this.chatRoomRepository.createQueryBuilder('room')
            .leftJoinAndSelect('room.job', 'job')
            .leftJoinAndSelect('room.company', 'company')
            .leftJoinAndSelect('room.candidate', 'candidate')
            .leftJoinAndSelect('room.messages', 'messages')
            .addOrderBy('messages.createdAt', 'DESC');

        if (role === 'CANDIDATE') {
            query.where('room.candidateId = :userId', { userId });
        } else {
            // For Employer, we need to find the company first, or use the companyId from user
            // Assuming the controller passes the companyId if role is EMPLOYER
            query.where('room.companyId = :userId', { userId });
        }

        const rooms = await query.getMany();
        
        // Add unread count and latest message preview to each room
        const roomsWithMeta = await Promise.all(rooms.map(async (room) => {
            const unreadCount = await this.messageRepository.count({
                where: { 
                    roomId: room.id, 
                    senderId: Not(userId), 
                    isRead: false 
                }
            });
            return { ...room, unreadCount };
        }));

        // Sort rooms by latest message date manually to be sure
        return roomsWithMeta.sort((a, b) => {
            const lastA = a.messages?.[0]?.createdAt ? new Date(a.messages[0].createdAt).getTime() : 0;
            const lastB = b.messages?.[0]?.createdAt ? new Date(b.messages[0].createdAt).getTime() : 0;
            return lastB - lastA;
        });
    }

    async markAsRead(roomId: string, userId: string) {
        await this.messageRepository.update(
            { roomId, senderId: Not(userId), isRead: false },
            { isRead: true }
        );
        return { success: true };
    }

    async getUnreadCount(userId: string, isEmployer: boolean = false) {
        this.logger.log(`Getting unread count for ${isEmployer ? 'Company' : 'Candidate'}: ${userId}`);
        
        const query = this.messageRepository.createQueryBuilder('message')
            .innerJoin('message.room', 'room')
            .where(isEmployer ? 'room.companyId = :userId' : 'room.candidateId = :userId', { userId })
            .andWhere('message.isRead = :isRead', { isRead: false });

        if (isEmployer) {
            // If employer, count messages sent by CANDIDATES (sender role is CANDIDATE)
            // Or simpler: senderId is the candidateId of the room
            query.andWhere('message.senderId = room.candidateId');
        } else {
            // If candidate, count messages sent by EMPLOYERS
            // Or simpler: senderId != candidateId
            query.andWhere('message.senderId != room.candidateId');
        }

        const count = await query.getCount();
        return { count };
    }
}
