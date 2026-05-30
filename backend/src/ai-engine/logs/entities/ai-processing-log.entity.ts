import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';

@Entity('ai_processing_logs')
export class AiProcessingLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'application_id', type: 'uuid', nullable: true })
    applicationId: string;

    @Column({ name: 'action_type' })
    actionType: string; // 'SCORING' | 'EMBEDDING' | 'CV_OPTIMIZATION' | 'REASONING'

    @Column({ name: 'model_used' })
    modelUsed: string; // gemini-1.5-pro, text-embedding-004...

    @Column({ name: 'prompt_tokens', default: 0 })
    promptTokens: number;

    @Column({ name: 'completion_tokens', default: 0 })
    completionTokens: number;

    @Column({ name: 'total_tokens', default: 0 })
    totalTokens: number;

    @Column({ name: 'cost_usd', type: 'decimal', precision: 10, scale: 6, default: 0 })
    costUsd: number;

    @Column({ name: 'latency_ms', default: 0 })
    latencyMs: number;

    @Column({ name: 'is_success', default: true })
    isSuccess: boolean;

    @Column({ name: 'error_message', type: 'text', nullable: true })
    errorMessage: string;

    @Column({ name: 'metadata', type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
