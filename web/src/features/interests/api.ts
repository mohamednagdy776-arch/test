import { apiClient } from '@/lib/api-client';

// [Body_Sadek] #754 — directed interest ("Send Salam") + profile views.
export const interestsApi = {
  send: (userId: string) =>
    apiClient.post(`/users/${userId}/interest`).then((r) => r.data),

  withdraw: (userId: string) =>
    apiClient.delete(`/users/${userId}/interest`).then((r) => r.data),

  received: () =>
    apiClient.get('/users/me/interests/received').then((r) => r.data),

  sent: () =>
    apiClient.get('/users/me/interests/sent').then((r) => r.data),

  profileViews: (page = 1, limit = 20) =>
    apiClient.get('/users/me/profile-views', { params: { page, limit } }).then((r) => r.data),
};
