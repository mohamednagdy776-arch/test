import { apiClient } from '@/lib/api-client';

export const subscriptionsApi = {
  getAll: (page = 1, limit = 20, status?: string, planType?: string) =>
    apiClient.get('/subscriptions', { params: { page, limit, status, planType } }).then((r) => r.data),

  cancel: (id: string) =>
    apiClient.patch(`/subscriptions/${id}/cancel`).then((r) => r.data),

  getStats: () =>
    apiClient.get('/subscriptions/stats').then((r) => r.data).catch(() => ({ data: {} })),
};
