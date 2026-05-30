import { apiRequest } from "@/lib/api";

export interface JobOffer {
    id: string;
    applicationId: string;
    salary: number;
    startDate: string;
    notes: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'NEGOTIATED';
    candidateFeedback?: string;
}

export const offerService = {
    create: (data: Partial<JobOffer>) => apiRequest<JobOffer>("/offers", "POST", { body: data }),
    getByApplication: (applicationId: string) => apiRequest<JobOffer>(`/offers/application/${applicationId}`),
    confirm: (id: string, confirmation: 'ACCEPTED' | 'REJECTED' | 'NEGOTIATED', feedback?: string) => 
        apiRequest<JobOffer>(`/offers/${id}/confirm`, "PATCH", { body: { confirmation, feedback } }),
};
