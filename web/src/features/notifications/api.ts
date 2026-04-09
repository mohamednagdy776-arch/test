import { apiClient } from '@/lib/api-client';

export const notificationsApi = {
  getNotifications: (page = 1, limit = 20) =>
    apiClient.get('/notifications', { params: { page, limit } }).then(r => r.data),

  getUnreadCount: () =>
    apiClient.get('/notifications/unread-count').then(r => r.data),

  markAsRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`).then(r => r.data),

  markAllAsRead: () =>
    apiClient.patch('/notifications/read-all').then(r => r.data),

  deleteNotification: (id: string) =>
    apiClient.delete(`/notifications/${id}`).then(r => r.data),
};
