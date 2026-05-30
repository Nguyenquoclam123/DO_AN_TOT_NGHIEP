import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'; @Entity('candidate_accounts') export class CandidateAccount {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() candidate_id: string;
  @Column({ select: false }) password_hash: string;
  @Column({ nullable: true }) last_login: Date;
  @Column({ nullable: true }) fcm_token: string;
}
