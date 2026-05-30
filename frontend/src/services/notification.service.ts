import { api } from '@/lib/api';

export interface Notification {
    id: string;
    title: string;
    content: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

export const notificationService = {
    getMyNotifications: async () => {
        return api.get<Notification[]>('/notifications/my');
    },
    markAsRead: async (id: string) => {
        return api.patch(`/notifications/${id}/read`, {});
    },
    markAllAsRead: async () => {
        return api.patch('/notifications/read-all', {});
    },
    markByApplicationId: async (applicationId: string) => {
        return api.patch(`/notifications/read-by-application/${applicationId}`, {});
    }
};
