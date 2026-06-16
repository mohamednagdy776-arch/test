import { apiClient } from '@/lib/api-client';

export const followsApi = {
  follow: (userId: string) =>
    apiClient.post(`/users/${userId}/follow`).then((r) => r.data),

  unfollow: (userId: string) =>
    apiClient.delete(`/users/${userId}/follow`).then((r) => r.data),

  status: (userId: string) =>
    apiClient.get(`/users/${userId}/follow-status`).then((r) => r.data),

  counts: (userId: string) =>
    apiClient.get(`/users/${userId}/follow-counts`).then((r) => r.data),

  followers: (userId: string, page = 1, limit = 20, search?: string) =>
    apiClient.get(`/users/${userId}/followers`, { params: { page, limit, search } }).then((r) => r.data),

  following: (userId: string, page = 1, limit = 20, search?: string) =>
    apiClient.get(`/users/${userId}/following`, { params: { page, limit, search } }).then((r) => r.data),
};
