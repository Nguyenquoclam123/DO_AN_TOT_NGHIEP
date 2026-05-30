import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Company } from '../../company/entities/company.entity';
import { Job } from '../../job/entities/job.entity';
import { Campaign } from '../../campaign/entities/campaign.entity';

@Entity('blogs')
export class Blog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ nullable: true })
    thumbnail: string;

    @Column({ name: 'company_id', type: 'uuid' })
    companyId: string;

    @Column({ name: 'campaign_id', type: 'uuid', nullable: true })
    campaignId: string;

    @Column({ name: 'job_id', type: 'uuid', nullable: true })
    jobId: string;

    @Column({ default: 'PUBLISHED' })
    status: string;

    @Column({ default: 0 })
    views: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relations
    @ManyToOne(() => Company)
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @ManyToOne(() => Campaign)
    @JoinColumn({ name: 'campaign_id' })
    campaign: Campaign;

    @ManyToOne(() => Job)
    @JoinColumn({ name: 'job_id' })
    job: Job;
}
