import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'; @Entity('staffs') export class Staff {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() company_id: string;
  @Column() full_name: string;
  @Column() email: string;
  @Column({ select: false }) password_hash: string;
  @Column({ nullable: true }) phone: string;
  @Column() role: string;
  @Column({ default: 'ACTIVE' }) status: string;
}
