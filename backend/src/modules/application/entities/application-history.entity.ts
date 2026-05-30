import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'; @Entity('application_history') export class ApplicationHistory {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() application_id: string;
  @Column({ nullable: true }) from_step_id: string;
  @Column() to_step_id: string;
  @Column() changed_by: string;
  @CreateDateColumn() changed_at: Date;
  @Column({ type: 'text', nullable: true }) note: string;
}
