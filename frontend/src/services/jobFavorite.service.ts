import { api } from "@/lib/api";

export interface Job {
    id: string;
    title: string;
    description: string;
    company: {
        id: string;
        name: string;
        logoUrl: string;
    };
    category: {
        id: string;
        name: string;
    };
    workLocation: string;
    minSalary: number;
    maxSalary: number;
    type: string;
    createdAt: string;
}

export interface FavoriteJob extends Job {
    savedAt: string;
    favoriteCategory?: {
        id: string;
        name: string;
    };
    status: string; // To handle ACTIVE/CLOSED
}

export interface FavoriteCategory {
    id: string;
    name: string;
}

export const jobFavoriteService = {
    async toggleFavorite(jobId: string, categoryId?: string): Promise<{ isFavorite: boolean }> {
        const url = categoryId 
            ? `/jobs/${jobId}/favorite?categoryId=${categoryId}` 
            : `/jobs/${jobId}/favorite`;
        const response = await api.post<{ isFavorite: boolean }>(url, {});
        return response;
    },

    async getFavorites(): Promise<FavoriteJob[]> {
        const response = await api.get<FavoriteJob[]>('/jobs/job-favorites-list');
        return response;
    },

    async checkFavorite(jobId: string): Promise<{ isFavorite: boolean }> {
        const response = await api.get<{ isFavorite: boolean }>(`/jobs/${jobId}/is-favorite`);
        return response;
    },

    // Category methods
    async getCategories(): Promise<FavoriteCategory[]> {
        return api.get<FavoriteCategory[]>('/jobs/favorite-categories');
    },

    async createCategory(name: string): Promise<FavoriteCategory> {
        return api.post<FavoriteCategory>('/jobs/favorite-categories', { name });
    }
};
