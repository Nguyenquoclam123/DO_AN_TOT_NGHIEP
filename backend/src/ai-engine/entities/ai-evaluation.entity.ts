import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'; @Entity('ai_evaluation_metrics') export class AIEvaluationMetric {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() application_id: string;
  @Column({ type: 'decimal', nullable: true }) ai_score: number;
  @Column({ type: 'decimal', nullable: true }) hr_review_score: number;
  @Column({ type: 'decimal', nullable: true }) score_variance: number;
  @Column({ default: false }) is_potential_flag: boolean;
  @Column({ nullable: true }) hr_decision: string;
  @Column({ type: 'text', nullable: true }) hr_notes: string;
}
