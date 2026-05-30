import { apiRequest } from "@/lib/api";

export interface CandidateProfile {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    address?: string;
    avatar?: string;
}

export const candidateService = {
    getMe: () => apiRequest<CandidateProfile>(`/candidates/me`),
    getProfile: (id: string) => apiRequest<CandidateProfile>(`/candidates/${id}`),
    updateProfile: (id: string, data: Partial<CandidateProfile>) => apiRequest<CandidateProfile>(`/candidates/${id}`, "PATCH", { body: data }),
};
