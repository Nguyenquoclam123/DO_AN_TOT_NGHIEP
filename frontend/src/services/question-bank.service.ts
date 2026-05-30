import { apiRequest } from "@/lib/api";

export const questionBankService = {
    getSets: (query?: { positionId?: string, levelId?: string, companyId?: string }) => {
        const params = new URLSearchParams();
        if (query?.positionId) params.append('positionId', query.positionId);
        if (query?.levelId) params.append('levelId', query.levelId);
        if (query?.companyId !== undefined) {
            params.append('companyId', query.companyId || '');
        }
        return apiRequest<any[]>(`/question-bank/sets?${params.toString()}`);
    },

    getSummary: () => apiRequest<any[]>("/question-bank/summary"),

    getSetDetail: (id: string) => apiRequest<any>(`/question-bank/sets/${id}`),

    createSet: (data: any) => apiRequest<any>("/question-bank/sets", "POST", { body: data }),

    addQuestion: (setId: string, data: any) =>
        apiRequest<any>(`/question-bank/sets/${setId}/questions`, "POST", { body: data }),

    bulkAddQuestions: (setId: string, questions: any[]) =>
        apiRequest<any>(`/question-bank/sets/${setId}/questions/bulk`, "POST", { body: { questions } }),

    updateQuestion: (id: string, data: any) =>
        apiRequest<any>(`/question-bank/questions/${id}`, "PATCH", { body: data }),

    deleteQuestion: (id: string) =>
        apiRequest<any>(`/question-bank/questions/${id}`, "DELETE"),

    updateSet: (id: string, data: any) =>
        apiRequest<any>(`/question-bank/sets/${id}`, "PATCH", { body: data }),

    deleteSet: (id: string) =>
        apiRequest<any>(`/question-bank/sets/${id}`, "DELETE"),

    reorderQuestions: (setId: string, questionIds: string[]) =>
        apiRequest<any>(`/question-bank/sets/${setId}/reorder`, "POST", { body: { questionIds } }),
};
