import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/**
 * Axios instance với interceptors
 */
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Gửi cookie tự động
});

apiClient.interceptors.request.use(
    (config) => {
        // Ưu tiên lấy token từ localStorage để đính kèm vào Header cho Backend
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('access_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Response interceptor — Xử lý 401 tự động refresh token
apiClient.interceptors.response.use(
    (response) => response.data, // Tự động unwrap response.data
    async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Gọi refresh token
                await apiClient.post('/auth/refresh');
                return apiClient(originalRequest);
            } catch {
                // Refresh thất bại → redirect về login
                if (typeof window !== 'undefined') {
                    // Clear both localStorage and Cookies
                    localStorage.removeItem('access_token');
                    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax";
                    window.location.href = '/auth/login';
                }
            }
        }

        return Promise.reject(error);
    },
);

export default apiClient;
