import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { Company } from '../../company/entities/company.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ name: 'password_hash', select: false })
    passwordHash: string;

    @Column({ nullable: true })
    firstName: string;

    @Column({ nullable: true })
    lastName: string;

    @Column({ default: 'CANDIDATE' })
    role: string;

    @Column({ default: 'ACTIVE' })
    status: string;

    @Column({ name: 'company_id', nullable: true, type: 'uuid' })
    companyId: string;

    @ManyToOne(() => Company, (company) => company.employees)
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @OneToOne('Candidate', 'user')
    candidateProfile: any;
}
