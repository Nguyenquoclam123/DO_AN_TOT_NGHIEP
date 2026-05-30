export interface Job {
    id: string;
    title: string;
    description: string;
    requirements?: string;
    minSalary?: number;
    maxSalary?: number;
    location: string;
    workType: 'remote' | 'onsite' | 'hybrid';
    experienceYears?: number;
    status: 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'PAUSED' | 'CLOSED';
    companyId: string;
    campaignId?: string;
    expiresAt?: string;
    createdAt: string;
    // Joined
    company?: { name: string; logoUrl?: string };
    similarityScore?: number; // Từ vector search
}

export interface JobSearchParams {
    q?: string;
    location?: string;
    workType?: string;
    minSalary?: number;
    maxSalary?: number;
    experienceYears?: number;
    page?: number;
    limit?: number;
}
