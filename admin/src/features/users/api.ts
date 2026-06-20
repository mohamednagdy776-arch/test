import { apiClient } from '@/lib/api-client';
import type { SearchParams } from '@/types';

export const usersApi = {
  getUsers: (page = 1, limit = 20) =>
    apiClient.get('/users', { params: { page, limit } }).then((r) => r.data),

  getUser: (id: string) =>
    apiClient.get(`/users/${id}`).then((r) => r.data),

  searchUsers: (params: SearchParams) =>
    apiClient.get('/users/search', { params }).then((r) => {
      const d = r.data;
      // /users/search wraps results in data.data; flatten to match /users shape
      if (d?.data?.data !== undefined) {
        return {
          ...d,
          data: d.data.data.map((u: Record<string, unknown>) => ({ ...u, id: u.id ?? u.userId })),
          meta: d.data.meta,
        };
      }
      return d;
    }),

  getUserProfile: (id: string) =>
    apiClient.get(`/users/${id}/profile`).then((r) => r.data),

  banUser: (id: string) =>
    apiClient.patch(`/users/${id}/ban`).then((r) => r.data),

  unbanUser: (id: string) =>
    apiClient.patch(`/users/${id}/unban`).then((r) => r.data),
};
