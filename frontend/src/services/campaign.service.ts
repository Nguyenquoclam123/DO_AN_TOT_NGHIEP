import { api } from '@/lib/api';

export interface Campaign {
    id: string;
    name: string;
    description: string;
    status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
    startDate: string;
    endDate: string;
    jobs?: Array<{
        id: string;
        title: string;
        description: string;
        status: string;
        position?: any;
        level?: any;
        stats?: {
            appliedCount: number;
            interviewingCount: number;
        }
    }>;
    createdAt: string;
    company?: {
        id: string;
        name: string;
        logo?: string;
    };
}

export const campaignService = {
    getAll: async () => {
        return api.get<Campaign[]>('/campaigns');
    },
    getById: async (id: string) => {
        return api.get<Campaign>(`/campaigns/${id}`);
    },
    create: async (data: Partial<Campaign>) => {
        return api.post<Campaign>('/campaigns', data);
    },
    update: async (id: string, data: Partial<Campaign>) => {
        return api.patch<Campaign>(`/campaigns/${id}`, data);
    },
    delete: async (id: string) => {
        return api.delete(`/campaigns/${id}`);
    }
};
