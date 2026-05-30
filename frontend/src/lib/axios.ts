import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Chặn yêu cầu gửi đi để gắn Token
api.interceptors.request.use((config) => {
    // Ưu tiên lấy token từ Cookie hoặc LocalStorage nếu có
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Chặn phản hồi trả về để xử lý lỗi hệ thống (401, 500...)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                // document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                // window.location.href = '/auth/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
