import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    OneToOne
} from 'typeorm';
import { Job } from '../../job/entities/job.entity';
import { CandidateCv } from '../../cv/entities/candidate-cv.entity';
import { User } from '../../user/entities/user.entity';
import { AppAnswer } from './app-answer.entity';
import { JobOffer } from '../../offer/entities/offer.entity';
import { ApplicationStatusHistory } from './application-status-history.entity';

@Entity('applications')
export class Application {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'job_id', type: 'uuid' })
    jobId: string;

    @Column({ name: 'candidate_id', type: 'uuid' })
    candidateId: string;

    @Column({ name: 'cv_id', type: 'uuid' })
    cvId: string;

    @Column({
        type: 'varchar',
        default: 'APPLIED',
        comment: 'APPLIED, INVITED, INTERVIEWING, OFFER, HIRED, REJECTED, CANCELLED'
    })
    status: string;

    @Column({ type: 'text', nullable: true })
    note: string;

    @Column({ type: 'float', default: 0 })
    score: number;

    @Column({ type: 'jsonb', nullable: true })
    aiReport: any;

    @Column({
        type: 'varchar',
        nullable: true,
        comment: 'ACCURATE, INACCURATE, PARTIAL'
    })
    aiFeedback: string;

    @Column({ type: 'text', nullable: true })
    aiComment: string;

    @Column({ name: 'viewed_at', type: 'timestamp', nullable: true })
    viewedAt: Date;

    @Column({ name: 'rejection_reason', type: 'text', nullable: true })
    rejectionReason: string;

    @Column({ name: 'withdraw_reason', type: 'text', nullable: true })
    withdrawReason: string;

    @Column({
        name: 'withdraw_status',
        type: 'varchar',
        nullable: true,
        comment: 'PENDING, ACCEPTED'
    })
    withdrawStatus: string;

    @Column({ name: 'cv_snapshot', type: 'jsonb', nullable: true })
    cvSnapshot: any;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relations
    @ManyToOne(() => Job, (job) => job.applications)
    @JoinColumn({ name: 'job_id' })
    job: Job;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'candidate_id' })
    candidate: User;

    @ManyToOne(() => CandidateCv)
    @JoinColumn({ name: 'cv_id' })
    cv: CandidateCv;

    @OneToMany('Interview', 'application')
    interviews: any[];

    @OneToMany(() => AppAnswer, (answer) => (answer as any).application, { cascade: true })
    answers: any[];

    @OneToOne(() => JobOffer, (offer) => offer.application)
    offer: JobOffer;

    @OneToMany(() => ApplicationStatusHistory, (history) => history.application)
    statusHistory: ApplicationStatusHistory[];
}
