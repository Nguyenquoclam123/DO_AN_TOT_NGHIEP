import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Job } from './job.entity';

@Entity('job_skills')
export class JobSkill extends BaseEntity {
    @Column({ name: 'job_id' })
    jobId: string;

    @Column({ name: 'skill_name' })
    skillName: string;

    @Column({ name: 'is_required', default: true })
    isRequired: boolean;

    @ManyToOne(() => Job, (job) => job.skills)
    @JoinColumn({ name: 'job_id' })
    job: Job;
}
