import { apiRequest } from "@/lib/api";

export interface Question {
    id?: string;
    content: string;
    position?: string;
    type: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'CODING' | 'VIDEO';
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    category: string;
    options?: string[]; // For multiple choice
    correctAnswer?: string;
}

export interface QuestionSet {
    id?: string;
    name: string;
    description: string;
    questions: Question[];
}

export const questionService = {
    // Question Sets
    getSets: () => apiRequest<QuestionSet[]>("/questions/sets"),
    getSetById: (id: string) => apiRequest<QuestionSet>(`/questions/sets/${id}`),
    createSet: (data: Partial<QuestionSet>) => apiRequest<QuestionSet>("/questions/sets", "POST", { body: data }),

    // Single Questions
    getAll: () => apiRequest<Question[]>("/questions"), // Added for dashboard folder view

    createQuestion: (setId: string, data: Partial<Question>) =>
        apiRequest<Question>(`/questions/sets/${setId}/questions`, "POST", { body: data }),

    updateQuestion: (id: string, data: Partial<Question>) =>
        apiRequest<Question>(`/questions/${id}`, "PATCH", { body: data }),

    delete: (id: string) => apiRequest(`/questions/${id}`, "DELETE"),
    deleteQuestion: (id: string) => apiRequest(`/questions/${id}`, "DELETE"),

    // AI Generation
    generateAILogic: (prompt: string) => apiRequest<{ questions: Question[] }>("/questions/ai-generate", "POST", { body: { prompt } }),
};
