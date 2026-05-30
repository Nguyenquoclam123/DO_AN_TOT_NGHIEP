export interface User {
    id: string;
    email: string;
    fullName: string;
    role: 'EMPLOYER' | 'CANDIDATE' | 'ADMIN';
    companyId?: string;
    avatarUrl?: string;
    phoneNumber?: string;
    isActive: boolean;
    createdAt: string;
}

export interface Company {
    id: string;
    name: string;
    industry: string;
    size: string;
    logoUrl?: string;
    website?: string;
    description?: string;
    isVerified: boolean;
}
