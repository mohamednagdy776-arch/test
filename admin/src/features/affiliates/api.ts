import { apiClient } from '@/lib/api-client';

export const affiliatesApi = {
  getAll: (page = 1, limit = 20, status?: string) =>
    apiClient.get('/affiliates', { params: { page, limit, status } }).then((r) => r.data),

  approve: (id: string) =>
    apiClient.patch(`/affiliates/${id}/approve`).then((r) => r.data),

  suspend: (id: string) =>
    apiClient.patch(`/affiliates/${id}/suspend`).then((r) => r.data),
};
