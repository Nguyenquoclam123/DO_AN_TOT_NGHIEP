"use client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface FetchOptions extends RequestInit {
    body?: any;
}

export async function apiRequest<T>(
    endpoint: string,
    method: HttpMethod = 'GET',
    options: FetchOptions = {}
): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const config: RequestInit = {
        ...options,
        method,
        headers,
        ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        if (response.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax";
                window.location.href = '/auth/login';
            }
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Something went wrong');
        }

        if (response.status === 204) return {} as T;

        return await response.json();
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

export const api = {
    get: <T>(endpoint: string, options?: FetchOptions) => apiRequest<T>(endpoint, 'GET', options),
    post: <T>(endpoint: string, body: any, options?: FetchOptions) => apiRequest<T>(endpoint, 'POST', { ...options, body }),
    put: <T>(endpoint: string, body: any, options?: FetchOptions) => apiRequest<T>(endpoint, 'PUT', { ...options, body }),
    patch: <T>(endpoint: string, body: any, options?: FetchOptions) => apiRequest<T>(endpoint, 'PATCH', { ...options, body }),
    delete: <T>(endpoint: string, options?: FetchOptions) => apiRequest<T>(endpoint, 'DELETE', options),
};

export async function apiUpload<T>(
    endpoint: string,
    formData: FormData
): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const config: RequestInit = {
        method: 'POST',
        headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
    };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);
        
        if (!response.ok) {
            let errorMessage = 'File upload failed';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // If not JSON, try to get text
                const textError = await response.text();
                errorMessage = textError || `Error ${response.status}: ${response.statusText}`;
            }
            console.error(`Upload Error (${response.status}):`, errorMessage);
            throw new Error(errorMessage);
        }
        
        return await response.json();
    } catch (error: any) {
        console.error('apiUpload Exception:', error);
        throw error;
    }
}
