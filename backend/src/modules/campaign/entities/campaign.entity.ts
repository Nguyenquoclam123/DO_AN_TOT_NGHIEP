import { Entity, Column, ManyToOne, JoinColumn, OneToMany, ManyToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Company } from '../../company/entities/company.entity';
import { Job } from '../../job/entities/job.entity';

@Entity('campaigns')
export class Campaign extends BaseEntity {
    @Column()
    name: string;

    @Column({ name: 'company_id', type: 'uuid' })
    companyId: string;

    @Column({ default: 'ACTIVE' })
    status: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'start_date', type: 'date', nullable: true })
    startDate: Date;

    @Column({ name: 'end_date', type: 'date', nullable: true })
    endDate: Date;

    @ManyToOne(() => Company)
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @ManyToMany(() => Job, (job) => job.campaigns)
    jobs: Job[];
}
