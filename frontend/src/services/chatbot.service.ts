import { apiRequest } from "@/lib/api";

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface SuggestedJob {
    id: string;
    title: string;
    description: string;
    workLocation: string;
    minSalary?: number;
    maxSalary?: number;
    type?: string;
    companyName: string;
    companyLogo?: string;
    similarityScore: number;
}

export interface ChatResponse {
    message: string;
    suggestedJobs: SuggestedJob[];
    shouldSearch: boolean;
}

export interface CVRecommendation {
    jobId: string;
    matchReason: string;
    highlightSkills: string[];
}

export interface CVSuggestResponse {
    analysis: string;
    recommendations: CVRecommendation[];
    suggestedJobs: SuggestedJob[];
}

export const chatbotService = {
    chat: (message: string, history: ChatMessage[], cvId?: string) => {
        return apiRequest<ChatResponse>("/chatbot/chat", "POST", {
            body: { message, history, cvId }
        });
    },

    suggestByCv: (cvId: string) => {
        return apiRequest<CVSuggestResponse>("/chatbot/suggest-by-cv", "POST", {
            body: { cvId }
        });
    }
};
