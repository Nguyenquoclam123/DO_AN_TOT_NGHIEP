import apiClient from './api.client';

export interface ScoreResult {
    overallScore: number;
    dimensionScores: {
        skillsMatch: number;
        experienceMatch: number;
        educationMatch: number;
        cultureFit: number;
    };
    strengths: string[];
    weaknesses: string[];
    reasoning: string;
    recommendation: string;
}

export interface CvOptimizationResult {
    currentScore: number;
    potentialScore: number;
    suggestions: {
        section: string;
        current: string;
        improved: string;
        reason: string;
    }[];
    missingKeywords: string[];
    overallAdvice: string;
}

export const aiService = {
    /**
     * Lấy điểm AI của một application
     */
    getApplicationScore: (applicationId: string): Promise<ScoreResult> =>
        apiClient.get(`/ai/score/${applicationId}`),

    /**
     * Trigger chấm điểm AI cho một Application
     */
    triggerScoring: (applicationId: string): Promise<{ jobId: string }> =>
        apiClient.post(`/ai/score/${applicationId}/trigger`),

    /**
     * Tối ưu CV theo Job Description
     */
    optimizeCV: (cvId: string, jobId: string): Promise<CvOptimizationResult> =>
        apiClient.post('/ai/cv/optimize', { cvId, jobId }),

    /**
     * Employer gửi feedback về điểm AI
     */
    submitFeedback: (applicationId: string, rating: number, note?: string) =>
        apiClient.post(`/ai/feedback/${applicationId}`, { rating, note }),

    /**
     * Admin: Lấy danh sách AI configs
     */
    getAiConfigs: () =>
        apiClient.get('/ai/control/configs'),

    /**
     * Admin: Cập nhật AI config (model, prompt)
     */
    updateAiConfig: (configId: string, data: Partial<any>) =>
        apiClient.patch(`/ai/control/configs/${configId}`, data),

    /**
     * Admin: Lấy thống kê token usage và chi phí
     */
    getTokenUsageStats: (from: string, to: string) =>
        apiClient.get('/ai/control/stats', { params: { from, to } }),
};
