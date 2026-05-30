import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Application } from './application.entity';
import { User } from '../../user/entities/user.entity';

@Entity('application_status_history')
export class ApplicationStatusHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'application_id', type: 'uuid' })
    applicationId: string;

    @Column({ type: 'varchar' })
    status: string;

    @Column({ type: 'text', nullable: true })
    note: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ type: 'json', nullable: true })
    payload: any;

    @Column({ name: 'actor_id', type: 'uuid', nullable: true })
    actorId: string;

    @Column({ name: 'actor_role', nullable: true })
    actorRole: string; // CANDIDATE, EMPLOYER, SYSTEM

    @Column({ name: 'action_type', nullable: true })
    actionType: string; // STATUS_CHANGE, INTERVIEW_UPDATED, CANDIDATE_RESPONDED, OFFER_NEGOTIATED

    @ManyToOne(() => Application, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'application_id' })
    application: Application;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'actor_id' })
    actor: User;
}
