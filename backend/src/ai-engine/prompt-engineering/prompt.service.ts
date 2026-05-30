import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CV_SCORING_PROMPT, CV_OPTIMIZATION_PROMPT } from './prompts/cv-scoring.prompt';
import { CV_PARSING_PROMPT } from './prompts/cv-parsing.prompt';
import { JOB_ANALYSIS_PROMPT } from './prompts/job-analysis.prompt';

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

import { SettingService } from '../../modules/setting/setting.service';

@Injectable()
export class PromptService {
    private readonly logger = new Logger(PromptService.name);
    private readonly genAI: GoogleGenerativeAI;

    constructor(
        private configService: ConfigService,
        private settingService: SettingService,
    ) {
        const apiKey = this.configService.get<string>('ai.geminiApiKey');
        this.logger.log(`Initializing Gemini with API Key: ${apiKey?.substring(0, 5)}...`);
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    private async getModel() {
        const modelName = await this.settingService.get('ai_model') || 'gemini-1.5-pro';
        return this.genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
                temperature: Number(await this.settingService.get('ai_temperature')) || 0.3,
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
        const systemInstruction = await this.settingService.get('ai_system_prompt') || '';
        const prompt = systemInstruction + '\n\n' + CV_SCORING_PROMPT(jobDescription, cvText);

        try {
            const model = await this.getModel();
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const parsed = JSON.parse(responseText);
            const latencyMs = Date.now() - start;

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
                tokensUsed: result.response.usageMetadata?.totalTokenCount || 0,
                latencyMs,
            };
        } catch (error) {
            this.logger.error('Executive CV scoring failed', error);
            throw error;
        }
    }

    /**
     * ⭐ Phân tích Job để chuẩn bị cho Vector Embedding
     */
    async analyzeJobForVector(jdText: string) {
        const prompt = JOB_ANALYSIS_PROMPT(jdText);

        try {
            const model = await this.getModel();
            const result = await model.generateContent(prompt);
            return JSON.parse(result.response.text());
        } catch (error) {
            this.logger.error('Job analysis for vectorization failed', error);
            throw error;
        }
    }

    /**
     * ⭐ Trích xuất dữ liệu có cấu trúc từ CV text
     */
    async parseCv(cvText: string) {
        const systemInstruction = await this.settingService.get('ai_system_prompt') || '';
        const prompt = systemInstruction + '\n\n' + CV_PARSING_PROMPT(cvText);

        try {
            const model = await this.getModel();
            const result = await model.generateContent(prompt);
            return JSON.parse(result.response.text());
        } catch (error) {
            this.logger.error('CV parsing failed', error);
            throw error;
        }
    }

    /**
     * ⭐ Gợi ý tối ưu CV theo JD
     */
    async optimizeCvForJob(jobDescription: string, cvText: string) {
        const prompt = CV_OPTIMIZATION_PROMPT(jobDescription, cvText);

        try {
            const model = await this.getModel();
            const result = await model.generateContent(prompt);
            return JSON.parse(result.response.text());
        } catch (error) {
            this.logger.error('CV optimization failed', error);
            throw error;
        }
    }
}
