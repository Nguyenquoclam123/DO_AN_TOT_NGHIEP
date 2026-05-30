import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ChatRoom } from './chat-room.entity';
import { User } from '../../user/entities/user.entity';

@Entity('messages')
export class Message extends BaseEntity {
  @Column({ name: 'room_id' })
  roomId: string;

  @Column({ name: 'sender_id', nullable: true })
  senderId: string;

  @Column({ name: 'message_text', type: 'text' })
  messageText: string;

  @Column({ name: 'attachment_url', nullable: true })
  attachmentUrl: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => ChatRoom, (room) => room.messages)
  @JoinColumn({ name: 'room_id' })
  room: ChatRoom;
}
