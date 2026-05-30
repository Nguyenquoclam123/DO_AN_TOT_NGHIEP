import { apiRequest, apiUpload } from "@/lib/api";

export interface CV {
    id?: string;
    userId: string;
    cvTitle: string;
    fileText: string;
    parsedContent?: any;
    builderData?: any;
    summary?: string;
    avatar?: string;
    experiences?: any[];
    educations?: any[];
    skills?: any[];
}

export interface OptimizationSuggestion {
    section: string;
    current: string;
    improved: string;
    reason: string;
}

export interface OptimizationResult {
    current_score: number;
    potential_score: number;
    suggestions: OptimizationSuggestion[];
    missing_keywords: string[];
    overall_advice: string;
}

export const cvService = {
    uploadAndParse: (cvTitle: string, fileText: string) => {
        return apiRequest<CV>("/cvs/upload", "POST", {
            body: { cv_title: cvTitle, file_text: fileText }
        });
    },

    // ⭐ AI CV Optimization logic
    optimize: (cvId: string, jobId: string) => {
        return apiRequest<OptimizationResult>("/cvs/optimize", "POST", {
            body: { cv_id: cvId, job_id: jobId }
        });
    },

    saveBuilder: (data: any) => apiRequest<CV>("/cvs", "POST", { body: data }),

    getMyCVs: () => apiRequest<CV[]>("/cvs/my"),
    getById: (id: string) => apiRequest<CV>(`/cvs/${id}`),
    getByCandidate: (candidateId: string) => apiRequest<CV[]>(`/cvs/candidate/${candidateId}`),

    getHistory: () => apiRequest<any>("/cvs/history"),
    delete: (id: string) => apiRequest(`/cvs/delete/${id}`, "POST"),
};
