import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { JobSkill } from './job-skill.entity';
import { JobCategory } from './job-category.entity';
import { JobRequirement } from './job-requirement.entity';
import { Application } from '../../application/entities/application.entity';
import { Company } from '../../company/entities/company.entity';
import { Campaign } from '../../campaign/entities/campaign.entity';
import { QuestionSet } from '../../question-bank/entities/question.entity';
import { ManyToMany, JoinTable } from 'typeorm';

@Entity('jobs')
export class Job {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'text', nullable: true })
    responsibilities: string;

    @Column({ type: 'text', nullable: true })
    benefits: string;

    @Column({ name: 'company_id', type: 'uuid' })
    companyId: string;



    @Column({ name: 'category_id', nullable: true })
    categoryId: string;

    @ManyToOne(() => JobCategory)
    @JoinColumn({ name: 'category_id' })
    category: JobCategory;

    @Column({ type: 'int', name: 'min_salary', nullable: true })
    minSalary: number;

    @Column({ type: 'int', name: 'max_salary', nullable: true })
    maxSalary: number;

    @Column({ name: 'work_location', nullable: true })
    workLocation: string;

    @Column({ nullable: true })
    type: string;

    @Column({ name: 'position_id', nullable: true })
    positionId: string;

    @Column({ name: 'level_id', nullable: true })
    levelId: string;

    @ManyToOne('JobPosition')
    @JoinColumn({ name: 'position_id' })
    position: any;

    @ManyToOne('JobLevel')
    @JoinColumn({ name: 'level_id' })
    level: any;

    @Column({ default: 1 })
    quantity: number;
    
    @Column({ name: 'min_experience', type: 'int', nullable: true })
    minExperience: number;

    @Column({ name: 'experience_note', type: 'text', nullable: true })
    experienceNote: string;

    @Column({ name: 'min_education', nullable: true })
    minEducation: string;

    @Column({ type: 'simple-array', nullable: true })
    certificates: string[];

    @Column({ default: 'ACTIVE' })
    status: string;

    @Column({ name: 'expired_at', type: 'timestamp', nullable: true })
    expiredAt: Date;

    // ⭐ Sửa lỗi biên dịch cho kiểu 'vector' của pgvector bằng cách ép kiểu Options sang any
    @Column({ type: 'vector', dimension: 3072, nullable: true, name: 'jd_vector' } as any)
    jdVector: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relations
    @ManyToOne(() => Company)
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @ManyToMany(() => Campaign, (campaign) => campaign.jobs)
    @JoinTable({
        name: 'job_campaign_mapping',
        joinColumn: { name: 'job_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'campaign_id', referencedColumnName: 'id' }
    })
    campaigns: Campaign[];

    @OneToMany(() => JobSkill, (jobSkill) => jobSkill.job, { cascade: true })
    skills: JobSkill[];

    @OneToMany(() => JobRequirement, (req) => req.job, { cascade: true })
    requirements: JobRequirement[];

    @OneToMany(() => Application, (app) => app.job)
    applications: Application[];

    @ManyToMany(() => QuestionSet)
    @JoinTable({
        name: 'job_question_sets',
        joinColumn: { name: 'job_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'question_set_id', referencedColumnName: 'id' }
    })
    questionSets: QuestionSet[];
}
