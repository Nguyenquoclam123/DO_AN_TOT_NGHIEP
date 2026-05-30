import { apiRequest } from "@/lib/api";

export interface Interview {
    id?: string;
    applicationId: string;
    scheduledAt: string;
    location: string;
    type: string;
    notes?: string;
    status?: string;
    candidateConfirmation?: string;
    candidateFeedback?: string;
}

export const interviewService = {
    schedule: (data: Interview) => apiRequest<Interview>("/interviews", "POST", { body: data }),
    getByApplication: (applicationId: string) => apiRequest<Interview[]>(`/interviews/application/${applicationId}`),
    update: (id: string, data: Partial<Interview>) => apiRequest<Interview>(`/interviews/${id}`, "PATCH", { body: data }),
    updateStatus: (id: string, status: string) => apiRequest<Interview>(`/interviews/${id}/status`, "PATCH", { body: { status } }),
    confirmInterview: (id: string, confirmation: 'ACCEPTED' | 'REJECTED' | 'RESCHEDULE_REQUESTED', feedback?: string) => 
        apiRequest<Interview>(`/interviews/${id}/confirm`, "PATCH", { body: { confirmation, feedback } }),
};
