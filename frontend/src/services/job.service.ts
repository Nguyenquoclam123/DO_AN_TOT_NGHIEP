import { apiRequest } from "@/lib/api";

export interface Job {
    id?: string;
    title: string;
    description: string;
    responsibilities?: string;
    requirements?: string;
    benefits?: string;
    minSalary?: number;
    maxSalary?: number;
    work_location?: string;
    location?: string;
    type?: string;
    campaignId?: string;
    campaigns?: any[];
    status?: string;
    applicationsCount?: number;
}

export const jobService = {
    getAll: () => apiRequest<Job[]>("/jobs"),
    getMyJobs: () => apiRequest<Job[]>("/jobs/my"),

    getById: (id: string) => apiRequest<Job>(`/jobs/${id}`),

    create: (data: Partial<Job>) => apiRequest<Job>("/jobs", "POST", { body: data }),

    update: (id: string, data: Partial<Job>) => apiRequest<Job>(`/jobs/${id}`, "PATCH", { body: data }),

    delete: (id: string) => apiRequest(`/jobs/${id}`, "DELETE"),

    getHistory: () => apiRequest<any>("/jobs/history"),
    
    // Custom: Get applicants for a specific job
    getApplicants: (jobId: string) => apiRequest<any[]>(`/jobs/${jobId}/applicants`),
};
