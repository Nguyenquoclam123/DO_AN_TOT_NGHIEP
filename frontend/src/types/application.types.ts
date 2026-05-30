export interface AiScore {
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
    recommendation: 'HIGHLY_RECOMMENDED' | 'RECOMMENDED' | 'NEUTRAL' | 'NOT_RECOMMENDED';
}

export interface Application {
    id: string;
    jobId: string;
    candidateId: string;
    cvId: string;
    status: 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED' | 'WITHDRAWN';
    aiScore?: number;
    aiReasoning?: string;
    aiProcessedAt?: string;
    employerFeedback?: number;
    feedbackNote?: string;
    pipelineStageId?: string;
    coverLetter?: string;
    appliedAt: string;
    // Joined
    candidate?: { fullName: string; email: string; avatarUrl?: string };
    job?: { title: string };
    cv?: { name: string; fileUrl: string };
}

export interface AiConfig {
    id: string;
    name: string;
    modelName: string;
    promptTemplate: string;
    isActive: boolean;
    updatedAt: string;
}

export interface TokenUsageStat {
    date: string;
    totalTokens: number;
    totalCostUsd: number;
    requestCount: number;
    modelUsed: string;
}
