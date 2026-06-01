import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AIModelConfig } from './entities/ai-config.entity';
import { AiProcessingLog } from '../logs/entities/ai-processing-log.entity';

@Injectable()
export class AiControlService implements OnModuleInit {
    private readonly logger = new Logger(AiControlService.name);

    constructor(
        @InjectRepository(AIModelConfig)
        private readonly aiModelConfigRepository: Repository<AIModelConfig>,
        @InjectRepository(AiProcessingLog)
        private readonly aiProcessingLogRepository: Repository<AiProcessingLog>,
    ) { }

    async onModuleInit() {
        try {
            const count = await this.aiModelConfigRepository.count();
            const hasInvalid = await this.aiModelConfigRepository.findOne({
                where: [
                    { model_name: 'gemini-1.5-flash' },
                    { model_name: 'gemini-1.5-pro' }
                ]
            });

            if (count === 0 || hasInvalid) {
                this.logger.log('Seeding default AI model configurations...');
                if (hasInvalid) {
                    await this.aiModelConfigRepository.clear();
                }
                const defaultConfigs = [
                    {
                        model_name: 'gemini-2.5-flash',
                        version: '2.5',
                        provider: 'Google AI',
                        temperature: 0.3,
                        max_tokens: 4096,
                        system_prompt: 'You are Nexus Talent AI, a high-performance recruitment orchestration agent.',
                        is_active: true
                    },
                    {
                        model_name: 'gemini-2.5-pro',
                        version: '2.5',
                        provider: 'Google AI',
                        temperature: 0.3,
                        max_tokens: 8192,
                        system_prompt: 'You are Nexus Talent AI, a high-performance recruitment orchestration agent.',
                        is_active: false
                    },
                    {
                        model_name: 'gemini-flash-latest',
                        version: '1.5',
                        provider: 'Google AI',
                        temperature: 0.3,
                        max_tokens: 4096,
                        system_prompt: 'You are Nexus Talent AI, a high-performance recruitment orchestration agent.',
                        is_active: false
                    },
                    {
                        model_name: 'gemini-pro-latest',
                        version: '1.5',
                        provider: 'Google AI',
                        temperature: 0.3,
                        max_tokens: 8192,
                        system_prompt: 'You are Nexus Talent AI, a high-performance recruitment orchestration agent.',
                        is_active: false
                    }
                ];
                await this.aiModelConfigRepository.save(
                    defaultConfigs.map(c => this.aiModelConfigRepository.create(c))
                );
                this.logger.log('Successfully seeded AI model configurations.');
            }
        } catch (error) {
            this.logger.error('Failed to seed default AI model configurations:', error.message);
        }
    }

    /**
     * Lấy cấu hình model đang hoạt động
     */
    async getActiveConfig(): Promise<AIModelConfig | null> {
        return await this.aiModelConfigRepository.findOne({ where: { is_active: true } });
    }

    /**
     * Lấy danh sách toàn bộ cấu hình model AI
     */
    async findAllConfigs(): Promise<AIModelConfig[]> {
        return await this.aiModelConfigRepository.find({ order: { model_name: 'ASC' } });
    }

    /**
     * Cập nhật cấu hình của một model
     */
    async updateConfig(id: string, data: Partial<AIModelConfig>): Promise<AIModelConfig> {
        const config = await this.aiModelConfigRepository.findOne({ where: { id } });
        if (!config) {
            throw new Error(`AI configuration with ID ${id} not found`);
        }

        // Nếu kích hoạt model này, vô hiệu hóa tất cả các model khác
        if (data.is_active === true) {
            await this.aiModelConfigRepository.update({ is_active: true }, { is_active: false });
        }

        Object.assign(config, data);
        return await this.aiModelConfigRepository.save(config);
    }

    /**
     * Ghi nhận log thực hiện cuộc gọi AI
     */
    async logRequest(data: {
        applicationId?: string;
        actionType: string;
        modelUsed: string;
        promptTokens: number;
        completionTokens: number;
        latencyMs: number;
        isSuccess: boolean;
        errorMessage?: string;
        metadata?: any;
    }) {
        let costUsd = 0;
        const model = data.modelUsed.toLowerCase();

        // Ước tính chi phí USD dựa trên bảng giá chuẩn Gemini API
        // Gemini 2.5 Flash / 1.5 Flash: $0.075 / 1M input, $0.30 / 1M output
        // Gemini 2.5 Pro / 1.5 Pro: $1.25 / 1M input, $5.00 / 1M output
        if (model.includes('pro')) {
            costUsd = (data.promptTokens * 1.25 + data.completionTokens * 5.00) / 1_000_000;
        } else {
            // Mặc định là dòng Flash
            costUsd = (data.promptTokens * 0.075 + data.completionTokens * 0.30) / 1_000_000;
        }

        try {
            const log = this.aiProcessingLogRepository.create({
                applicationId: data.applicationId,
                actionType: data.actionType,
                modelUsed: data.modelUsed,
                promptTokens: data.promptTokens,
                completionTokens: data.completionTokens,
                totalTokens: data.promptTokens + data.completionTokens,
                costUsd,
                latencyMs: data.latencyMs,
                isSuccess: data.isSuccess,
                errorMessage: data.errorMessage,
                metadata: data.metadata || {},
            });
            await this.aiProcessingLogRepository.save(log);
        } catch (e) {
            this.logger.error(`Failed to save AI log in database: ${e.message}`);
        }
    }

    /**
     * Lấy báo cáo thống kê hiệu suất chung và chi tiết theo từng model
     */
    async getPerformanceStats(from?: string, to?: string) {
        const queryBuilder = this.aiProcessingLogRepository.createQueryBuilder('log');

        if (from && to) {
            queryBuilder.where('log.created_at BETWEEN :from AND :to', { from: new Date(from), to: new Date(to) });
        }

        const logs = await queryBuilder.getMany();
        const totalRequests = logs.length;

        // Tính tổng quan chung
        const avgLatencyMs = totalRequests > 0
            ? Math.round(logs.reduce((acc, log) => acc + (log.latencyMs || 0), 0) / totalRequests)
            : 0;

        const totalTokens = logs.reduce((acc, log) => acc + (log.totalTokens || 0), 0);
        const totalCostUsd = parseFloat(
            logs.reduce((acc, log) => acc + Number(log.costUsd || 0), 0).toFixed(6)
        );

        const successfulRequests = logs.filter(log => log.isSuccess).length;
        const successRate = totalRequests > 0
            ? parseFloat(((successfulRequests / totalRequests) * 100).toFixed(1))
            : 100.0;

        // Lấy danh sách toàn bộ các model đã được định nghĩa trong hệ thống
        const allConfigs = await this.findAllConfigs();

        // Phân nhóm stats theo tên model
        const modelStatsBreakdown = allConfigs.map(config => {
            const modelLogs = logs.filter(log => log.modelUsed === config.model_name);
            const modelRequests = modelLogs.length;

            if (modelRequests === 0) {
                // Trả về dữ liệu trống/chưa dùng cho model này
                return {
                    model_name: config.model_name,
                    version: config.version,
                    provider: config.provider,
                    is_active: config.is_active,
                    has_data: false,
                    totalRequests: 0,
                    avgLatencyMs: 0,
                    totalTokens: 0,
                    totalCostUsd: 0,
                    successRate: 100.0
                };
            }

            const modelAvgLatency = Math.round(
                modelLogs.reduce((acc, log) => acc + (log.latencyMs || 0), 0) / modelRequests
            );
            const modelTokens = modelLogs.reduce((acc, log) => acc + (log.totalTokens || 0), 0);
            const modelCost = parseFloat(
                modelLogs.reduce((acc, log) => acc + Number(log.costUsd || 0), 0).toFixed(6)
            );
            const modelSuccess = modelLogs.filter(log => log.isSuccess).length;
            const modelSuccessRate = parseFloat(((modelSuccess / modelRequests) * 100).toFixed(1));

            return {
                model_name: config.model_name,
                version: config.version,
                provider: config.provider,
                is_active: config.is_active,
                has_data: true,
                totalRequests: modelRequests,
                avgLatencyMs: modelAvgLatency,
                totalTokens: modelTokens,
                totalCostUsd: modelCost,
                successRate: modelSuccessRate
            };
        });

        return {
            totalRequests,
            avgLatencyMs,
            totalTokens,
            totalCostUsd,
            successRate,
            models: modelStatsBreakdown
        };
    }
}
