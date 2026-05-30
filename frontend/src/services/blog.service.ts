import { apiRequest } from "@/lib/api";

export interface Blog {
    id: string;
    title: string;
    content: string;
    thumbnail?: string;
    companyId: string;
    campaignId?: string;
    jobId?: string;
    status: string;
    views: number;
    createdAt: string;
    updatedAt: string;
    company?: {
        id: string;
        name: string;
        logo?: string;
    };
    campaign?: {
        id: string;
        name: string;
    };
    job?: {
        id: string;
        title: string;
    };
}

class BlogService {
    async create(data: Partial<Blog>) {
        return apiRequest<Blog>("/blogs", "POST", { body: data });
    }

    async findAll(params: any = {}) {
        const query = new URLSearchParams(params).toString();
        return apiRequest<Blog[]>(`/blogs?${query}`, "GET");
    }

    async findMyBlogs() {
        return apiRequest<Blog[]>("/blogs/my", "GET");
    }

    async findOne(id: string) {
        return apiRequest<Blog>(`/blogs/${id}`, "GET");
    }

    async update(id: string, data: Partial<Blog>) {
        return apiRequest<Blog>(`/blogs/${id}`, "PATCH", { body: data });
    }

    async remove(id: string) {
        return apiRequest<void>(`/blogs/${id}`, "DELETE");
    }
}

export const blogService = new BlogService();
