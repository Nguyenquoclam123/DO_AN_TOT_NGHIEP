import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Job } from './job.entity';

@Entity('job_requirements')
export class JobRequirement extends BaseEntity {
    @Column({ name: 'job_id' })
    jobId: string;

    @Column({ name: 'required_position', nullable: true })
    requiredPosition: string;

    @Column({ name: 'min_years', nullable: true })
    minYears: number;

    @Column({ name: 'industry_context', nullable: true })
    industryContext: string;

    @ManyToOne(() => Job, (job) => job.requirements)
    @JoinColumn({ name: 'job_id' })
    job: Job;
}
