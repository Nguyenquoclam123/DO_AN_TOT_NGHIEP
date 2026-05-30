import { create } from 'zustand';
import { notificationService, Notification } from '@/services/notification.service';

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    markByApplicationId: (appId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    fetchNotifications: async () => {
        set({ isLoading: true });
        try {
            const data = await notificationService.getMyNotifications();
            set({ 
                notifications: data || [], 
                unreadCount: data?.filter((n: any) => !n.isRead).length || 0,
                isLoading: false 
            });
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
            set({ isLoading: false });
        }
    },
    markAsRead: async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            const { notifications } = get();
            const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
            set({ 
                notifications: updated,
                unreadCount: updated.filter(n => !n.isRead).length
            });
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    },
    markAllAsRead: async () => {
        try {
            await notificationService.markAllAsRead();
            const { notifications } = get();
            const updated = notifications.map(n => ({ ...n, isRead: true }));
            set({ 
                notifications: updated,
                unreadCount: 0
            });
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    },
    markByApplicationId: async (appId: string) => {
        try {
            await notificationService.markByApplicationId(appId);
            
            // Update local state
            const { notifications } = get();
            const updated = notifications.map(n => 
                (n as any).metadata?.applicationId === appId ? { ...n, isRead: true } : n
            );
            
            set({ 
                notifications: updated,
                unreadCount: updated.filter(n => !n.isRead).length
            });

            // Sync with Sidebar
            window.dispatchEvent(new CustomEvent('notifications-read'));
        } catch (error) {
            console.error("Failed to mark by application ID:", error);
        }
    }
}));
