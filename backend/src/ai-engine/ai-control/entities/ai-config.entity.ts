import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'; @Entity('ai_models_config') export class AIModelConfig {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() model_name: string;
  @Column() version: string;
  @Column() provider: string;
  @Column({ type: 'float', default: 0.3 }) temperature: number;
  @Column({ default: 4096 }) max_tokens: number;
  @Column({ type: 'text', nullable: true }) system_prompt: string;
  @Column({ default: true }) is_active: boolean;
}
