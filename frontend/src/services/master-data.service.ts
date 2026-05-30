import { apiRequest } from "@/lib/api";

export const masterDataService = {
    getPositions: (companyId?: string) =>
        apiRequest<any[]>(`/master-data/positions${companyId ? `?companyId=${companyId}` : ''}`),

    getPositionById: (id: string) =>
        apiRequest<any>(`/master-data/positions/${id}`),

    createPosition: (data: { name: string, description?: string, companyId?: string }) =>
        apiRequest<any>("/master-data/positions", "POST", { body: data }),

    updatePosition: (id: string, data: { name?: string, description?: string, isActive?: boolean }) =>
        apiRequest<any>(`/master-data/positions/${id}`, "PATCH", { body: data }),

    deletePosition: (id: string) =>
        apiRequest<any>(`/master-data/positions/${id}`, "DELETE"),

    getLevels: (companyId?: string) =>
        apiRequest<any[]>(`/master-data/levels${companyId ? `?companyId=${companyId}` : ''}`),

    createLevel: (data: { name: string, level: number, description?: string, companyId?: string }) =>
        apiRequest<any>("/master-data/levels", "POST", { body: data }),

    updateLevel: (id: string, data: { name?: string, level?: number, description?: string, isActive?: boolean }) =>
        apiRequest<any>(`/master-data/levels/${id}`, "PATCH", { body: data }),

    deleteLevel: (id: string) =>
        apiRequest<any>(`/master-data/levels/${id}`, "DELETE"),
};
