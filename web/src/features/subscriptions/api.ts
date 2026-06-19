import { apiClient } from '@/lib/api-client';

export const subscriptionsApi = {
  getMySubscriptions: () =>
    apiClient.get('/subscriptions/me').then(r => r.data),

  getActiveSubscription: () =>
    apiClient.get('/subscriptions/me/active').then(r => r.data),

  create: (planId: string) =>
    apiClient.post('/subscriptions', { planId }).then(r => r.data),

  cancel: (id: string) =>
    apiClient.patch(`/subscriptions/${id}/cancel`).then(r => r.data),
};
