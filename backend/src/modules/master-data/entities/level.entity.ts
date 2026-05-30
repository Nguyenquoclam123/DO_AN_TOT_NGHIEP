import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '../../company/entities/company.entity';

@Entity('levels')
export class JobLevel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'int', default: 1 })
    level: number;

    @Column({ type: 'text', nullable: true })
    description: string;

    @ManyToOne(() => Company)
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @Column({ name: 'company_id', nullable: true })
    companyId: string;

    @Column({ default: true, name: 'is_active' })
    isActive: boolean;
}
