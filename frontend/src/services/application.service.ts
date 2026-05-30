import { apiRequest } from "@/lib/api";

export interface AIReport {
    overallScore: number;
    dimensionScores: {
        skillsMatch: number;
        experienceMatch: number;
        educationMatch: number;
        cultureFit: number;
    };
    strengths: string[];
    weaknesses: string[];
    suitabilityReasoning: {
        logic: string;
        potentialRisks: string;
        growthAreas: string;
    };
    interviewQuestions: Array<{
        question: string;
        expectedAnswerInsight: string;
        difficulty: string;
    }>;
    recommendation: string;
}

export interface Application {
    id?: string;
    jobId: string;
    candidateId: string;
    cvId: string;
    status: 'APPLIED' | 'INVITED' | 'INTERVIEWING' | 'OFFER' | 'HIRED' | 'REJECTED';
    score?: number;
    aiReport?: AIReport;
    aiFeedback?: string;
    aiComment?: string;
    candidate?: any;
    job?: any;
    createdAt?: string;
}

export const applicationService = {
    // For Candidates
    apply: (data: { jobId: string; cvId: string; candidateId: string }) =>
        apiRequest<Application>("/applications", "POST", { body: data }),

    getMyApplications: () => apiRequest<Application[]>("/applications/my"),

    // Helper for consistency in dashboard
    findByCandidate: () => apiRequest<Application[]>("/applications/my"),

    // For Employers
    getByJob: (jobId: string) => apiRequest<Application[]>(`/applications/job/${jobId}`),

    updateStatus: (id: string, status: string) =>
        apiRequest<Application>(`/applications/${id}/status`, "PATCH", { body: { status } }),

    // ⭐ AI Deep Insight Report
    getAIReport: (id: string) => apiRequest<AIReport>(`/applications/${id}/ai-report`),

    getById: (id: string) => apiRequest<Application>(`/applications/${id}`),

    delete: (id: string) => apiRequest(`/applications/${id}`, "DELETE"),

    // ⭐ Get Global Talent Pool (Unique candidates)
    getTalentPool: () => apiRequest<any[]>("/applications/talent-pool"),

    // Get all applications (Admin/Employer)
    getAll: () => apiRequest<Application[]>("/applications"),

    triggerAI: (id: string) => apiRequest(`/applications/${id}/trigger-ai`, "POST"),
    submitFeedback: (id: string, feedback: string, comment?: string) =>
        apiRequest<Application>(`/applications/${id}/ai-feedback`, "POST", { body: { aiFeedback: feedback, aiComment: comment } }),
    requestWithdraw: (id: string, reason: string) =>
        apiRequest(`/applications/${id}/withdraw`, "POST", { body: { reason } }),
    acceptWithdraw: (id: string) =>
        apiRequest(`/applications/${id}/accept-withdraw`, "POST"),
};
