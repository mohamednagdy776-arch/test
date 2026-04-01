import { apiClient } from '@/lib/api-client';

export const usersApi = {
  getUsers: (page = 1, limit = 20) =>
    apiClient.get('/users', { params: { page, limit } }).then((r) => r.data),

  getUser: (id: string) =>
    apiClient.get(`/users/${id}`).then((r) => r.data),

  searchUsers: (query: string) =>
    apiClient.get('/users/search', { params: { name: query } }).then((r) => r.data),

  getUserProfile: (id: string) =>
    apiClient.get(`/users/${id}/profile`).then((r) => r.data),

  banUser: (id: string) =>
    apiClient.patch(`/users/${id}/ban`).then((r) => r.data),

  unbanUser: (id: string) =>
    apiClient.patch(`/users/${id}/unban`).then((r) => r.data),
};
