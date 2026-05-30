import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Application } from '../../application/entities/application.entity';

@Entity('interviews')
export class Interview extends BaseEntity {
    @Column({ name: 'application_id', type: 'uuid' })
    applicationId: string;

    @Column({ name: 'scheduled_at', type: 'timestamp' })
    scheduledAt: Date;

    @Column({ default: 'SCHEDULED' })
    status: string;

    @Column({ name: 'candidate_confirmation', default: 'PENDING' })
    candidateConfirmation: string; // PENDING, ACCEPTED, REJECTED

    @Column({ nullable: true })
    type: string;

    @Column({ nullable: true })
    location: string;

    @Column({ name: 'candidate_feedback', type: 'text', nullable: true })
    candidateFeedback: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @ManyToOne(() => Application, (app) => app.interviews)
    @JoinColumn({ name: 'application_id' })
    application: Application;
}
