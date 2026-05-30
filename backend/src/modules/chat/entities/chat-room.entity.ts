import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Message } from './message.entity';
import { Job } from '../../job/entities/job.entity';
import { User } from '../../user/entities/user.entity';
import { Company } from '../../company/entities/company.entity';

@Entity('chat_rooms')
export class ChatRoom extends BaseEntity {
    @Column({ name: 'application_id', nullable: true })
    applicationId: string;

    @Column({ name: 'job_id', nullable: true })
    jobId: string;

    @ManyToOne(() => Job)
    @JoinColumn({ name: 'job_id' })
    job: Job;

    @Column({ name: 'candidate_id', type: 'uuid' })
    candidateId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'candidate_id' })
    candidate: User;

    @Column({ name: 'company_id', type: 'uuid' })
    companyId: string;

    @ManyToOne(() => Company)
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @Column({ default: 'ACTIVE' })
    status: string;

    @OneToMany(() => Message, (message) => message.room)
    messages: Message[];
}
