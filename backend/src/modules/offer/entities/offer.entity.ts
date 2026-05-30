import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Application } from '../../application/entities/application.entity';

@Entity('job_offers')
export class JobOffer extends BaseEntity {
    @Column({ name: 'application_id', type: 'uuid' })
    applicationId: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    salary: number;

    @Column({ name: 'start_date', type: 'timestamp', nullable: true })
    startDate: Date;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ default: 'PENDING' })
    status: string; // PENDING, ACCEPTED, REJECTED, NEGOTIATED

    @Column({ name: 'candidate_feedback', type: 'text', nullable: true })
    candidateFeedback: string;

    @OneToOne(() => Application)
    @JoinColumn({ name: 'application_id' })
    application: Application;
}
