import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CV_SCORING_PROMPT, CV_OPTIMIZATION_PROMPT } from './prompts/cv-scoring.prompt';
import { CV_PARSING_PROMPT } from './prompts/cv-parsing.prompt';
import { JOB_ANALYSIS_PROMPT } from './prompts/job-analysis.prompt';
import { SettingService } from '../../modules/setting/setting.service';
import { AiControlService } from '../ai-control/ai-control.service';

export interface ScoringResult {
    overallScore: number;
    dimensionScores: {
        skillsMatch: number;
        experienceMatch: number;
        educationMatch: number;
        cultureFit: number;
    };
    strengths: Array<{
        point: string;
        detail: string;
        impact: string;
    }>;
    weaknesses: Array<{
        point: string;
        detail: string;
        risk: string;
    }>;
    suitabilityReasoning?: {
        logic: string;
        potentialRisks: string;
        growthAreas: string;
    };
    interviewQuestions?: Array<{
        question: string;
        expectedAnswerInsight: string;
        difficulty: string;
    }>;
    answersAnalysis?: Array<{
        question: string;
        answer: string;
        analysis: string;
        score: number; // 0-10
    }>;
    recommendation: string;
    tokensUsed: number;
    latencyMs: number;
}

@Injectable()
export class PromptService {
    private readonly logger = new Logger(PromptService.name);
    private readonly genAI: GoogleGenerativeAI;

    constructor(
        private configService: ConfigService,
        private settingService: SettingService,
        private aiControlService: AiControlService,
    ) {
        const apiKey = this.configService.get<string>('ai.geminiApiKey');
        this.logger.log(`Initializing Gemini with API Key: ${apiKey?.substring(0, 5)}...`);
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    private async getModelDetails() {
        const activeConfig = await this.aiControlService.getActiveConfig();
        const modelName = activeConfig?.model_name || await this.settingService.get('ai_model') || 'gemini-2.5-flash';
        const temperature = activeConfig?.temperature ?? Number(await this.settingService.get('ai_temperature')) ?? 0.3;
        const maxTokens = activeConfig?.max_tokens || 4096;
        const systemPrompt = activeConfig?.system_prompt || await this.settingService.get('ai_system_prompt') || '';

        return {
            modelName,
            temperature,
            maxTokens,
            systemPrompt
        };
    }

    private async getModelInstance(modelName: string, temperature: number, maxTokens: number) {
        return this.genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
                temperature,
                maxOutputTokens: maxTokens,
                responseMimeType: 'application/json',
            },
        });
    }

    /**
     * ⭐ Chấm điểm CV theo Job Description (Executive Edition)
     */
    async scoreCvAgainstJob(
        jobDescription: string,
        cvText: string,
    ): Promise<ScoringResult> {
        const start = Date.now();
        const { modelName, temperature, maxTokens, systemPrompt } = await this.getModelDetails();
        const prompt = systemPrompt + '\n\n' + CV_SCORING_PROMPT(jobDescription, cvText);

        try {
            const model = await this.getModelInstance(modelName, temperature, maxTokens);
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const parsed = JSON.parse(responseText);
            const latencyMs = Date.now() - start;

            const promptTokens = result.response.usageMetadata?.promptTokenCount || 0;
            const completionTokens = result.response.usageMetadata?.candidatesTokenCount || 0;

            // Ghi log vào ai_processing_logs
            this.aiControlService.logRequest({
                actionType: 'SCORING',
                modelUsed: modelName,
                promptTokens,
                completionTokens,
                latencyMs,
                isSuccess: true,
                metadata: { temperature, maxTokens }
            }).catch(e => this.logger.error(`Failed to write scoring log: ${e.message}`));

            return {
                overallScore: parsed.overall_score,
                dimensionScores: {
                    skillsMatch: parsed.dimension_scores?.skills_match,
                    experienceMatch: parsed.dimension_scores?.experience_match,
                    educationMatch: parsed.dimension_scores?.education_match,
                    cultureFit: parsed.dimension_scores?.culture_fit,
                },
                strengths: parsed.strengths || [],
                weaknesses: parsed.weaknesses || [],
                suitabilityReasoning: {
                    logic: parsed.suitability_reasoning?.logic,
                    potentialRisks: parsed.suitability_reasoning?.potential_risks,
                    growthAreas: parsed.suitability_reasoning?.growth_areas,
                },
                interviewQuestions: (parsed.interview_questions || []).map((q: any) => ({
                    question: q.question,
                    expectedAnswerInsight: q.expected_answer_insight,
                    difficulty: q.difficulty
                })),
                answersAnalysis: (parsed.answers_analysis || []).map((a: any) => ({
                    question: a.question,
                    answer: a.answer,
                    analysis: a.analysis,
                    score: a.score
                })),
                recommendation: parsed.recommendation,
                tokensUsed: promptTokens + completionTokens,
                latencyMs,
            };
        } catch (error) {
            const latencyMs = Date.now() - start;
            this.aiControlService.logRequest({
                actionType: 'SCORING',
                modelUsed: modelName,
                promptTokens: 0,
                completionTokens: 0,
                latencyMs,
                isSuccess: false,
                errorMessage: error.message || String(error),
                metadata: { temperature, maxTokens }
            }).catch(e => this.logger.error(`Failed to write scoring error log: ${e.message}`));

            this.logger.error('Executive CV scoring failed', error);
            throw error;
        }
    }

    /**
     * ⭐ Phân tích Job để chuẩn bị cho Vector Embedding
     */
    async analyzeJobForVector(jdText: string) {
        const start = Date.now();
        const { modelName, temperature, maxTokens } = await this.getModelDetails();
        const prompt = JOB_ANALYSIS_PROMPT(jdText);

        try {
            const model = await this.getModelInstance(modelName, temperature, maxTokens);
            const result = await model.generateContent(prompt);
            const latencyMs = Date.now() - start;

            const promptTokens = result.response.usageMetadata?.promptTokenCount || 0;
            const completionTokens = result.response.usageMetadata?.candidatesTokenCount || 0;

            this.aiControlService.logRequest({
                actionType: 'EMBEDDING',
                modelUsed: modelName,
                promptTokens,
                completionTokens,
                latencyMs,
                isSuccess: true,
                metadata: { temperature, maxTokens }
            }).catch(e => this.logger.error(`Failed to write job analysis log: ${e.message}`));

            return JSON.parse(result.response.text());
        } catch (error) {
            const latencyMs = Date.now() - start;
            this.aiControlService.logRequest({
                actionType: 'EMBEDDING',
                modelUsed: modelName,
                promptTokens: 0,
                completionTokens: 0,
                latencyMs,
                isSuccess: false,
                errorMessage: error.message || String(error),
                metadata: { temperature, maxTokens }
            }).catch(e => this.logger.error(`Failed to write job analysis error log: ${e.message}`));

            this.logger.error('Job analysis for vectorization failed', error);
            throw error;
        }
    }

    /**
     * ⭐ Trích xuất dữ liệu có cấu trúc từ CV text
     */
    async parseCv(cvText: string) {
        const start = Date.now();
        const { modelName, temperature, maxTokens, systemPrompt } = await this.getModelDetails();
        const prompt = systemPrompt + '\n\n' + CV_PARSING_PROMPT(cvText);

        try {
            const model = await this.getModelInstance(modelName, temperature, maxTokens);
            const result = await model.generateContent(prompt);
            const latencyMs = Date.now() - start;

            const promptTokens = result.response.usageMetadata?.promptTokenCount || 0;
            const completionTokens = result.response.usageMetadata?.candidatesTokenCount || 0;

            this.aiControlService.logRequest({
                actionType: 'CV_PARSING',
                modelUsed: modelName,
                promptTokens,
                completionTokens,
                latencyMs,
                isSuccess: true,
                metadata: { temperature, maxTokens }
            }).catch(e => this.logger.error(`Failed to write CV parse log: ${e.message}`));

            return JSON.parse(result.response.text());
        } catch (error) {
            const latencyMs = Date.now() - start;
            this.aiControlService.logRequest({
                actionType: 'CV_PARSING',
                modelUsed: modelName,
                promptTokens: 0,
                completionTokens: 0,
                latencyMs,
                isSuccess: false,
                errorMessage: error.message || String(error),
                metadata: { temperature, maxTokens }
            }).catch(e => this.logger.error(`Failed to write CV parse error log: ${e.message}`));

            this.logger.error('CV parsing failed', error);
            throw error;
        }
    }

    /**
     * ⭐ Gợi ý tối ưu CV theo JD
     */
    async optimizeCvForJob(jobDescription: string, cvText: string) {
        const start = Date.now();
        const { modelName, temperature, maxTokens } = await this.getModelDetails();
        const prompt = CV_OPTIMIZATION_PROMPT(jobDescription, cvText);

        try {
            const model = await this.getModelInstance(modelName, temperature, maxTokens);
            const result = await model.generateContent(prompt);
            const latencyMs = Date.now() - start;

            const promptTokens = result.response.usageMetadata?.promptTokenCount || 0;
            const completionTokens = result.response.usageMetadata?.candidatesTokenCount || 0;

            this.aiControlService.logRequest({
                actionType: 'CV_OPTIMIZATION',
                modelUsed: modelName,
                promptTokens,
                completionTokens,
                latencyMs,
                isSuccess: true,
                metadata: { temperature, maxTokens }
            }).catch(e => this.logger.error(`Failed to write optimization log: ${e.message}`));

            return JSON.parse(result.response.text());
        } catch (error) {
            const latencyMs = Date.now() - start;
            this.aiControlService.logRequest({
                actionType: 'CV_OPTIMIZATION',
                modelUsed: modelName,
                promptTokens: 0,
                completionTokens: 0,
                latencyMs,
                isSuccess: false,
                errorMessage: error.message || String(error),
                metadata: { temperature, maxTokens }
            }).catch(e => this.logger.error(`Failed to write optimization error log: ${e.message}`));

            this.logger.error('CV optimization failed', error);
            throw error;
        }
    }
}
