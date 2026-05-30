import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity('companies')
export class Company extends BaseEntity {
  @Column()
  name: string;

  @Column({ name: 'tax_code', nullable: true, unique: true })
  taxCode: string;

  @Column({ nullable: true })
  website: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;

  @Column({ name: 'cover_url', nullable: true })
  coverUrl: string;

  @Column({ name: 'industry_id', nullable: true })
  industryId: string;

  @Column({ nullable: true })
  scale: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'map_location', type: 'jsonb', nullable: true })
  mapLocation: any;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ nullable: true })
  email: string;

  @Column({ name: 'established_date', nullable: true })
  establishedDate: string;

  @Column({ nullable: true })
  representative: string;

  @Column({ name: 'employee_count', nullable: true })
  employeeCount: number;

  @Column({ type: 'jsonb', nullable: true })
  offices: any[]; // { label: string, address: string }[]

  @Column({ type: 'jsonb', nullable: true })
  awards: any[]; // { title: string, year: string, description: string }[]

  @Column({ type: 'jsonb', nullable: true })
  services: any[]; // { title: string, description: string, details?: string }[]

  @Column({ type: 'jsonb', nullable: true })
  members: any[]; // { name: string, position: string, imageUrl?: string, description?: string }[]

  @Column({ type: 'jsonb', nullable: true })
  partners: any[]; // { name: string, logoUrl?: string, website?: string }[]

  // Legacy fields from duplicate entity if needed
  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  culture: string;

  @Column({ default: 'PENDING' })
  status: string;

  @OneToMany(() => User, (user) => user.company)
  employees: User[];
}
