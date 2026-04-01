import { apiClient } from '@/lib/api-client';

export const groupsApi = {
  getGroups: (page = 1, limit = 20) =>
    apiClient.get('/groups', { params: { page, limit } }).then((r) => r.data),

  searchGroups: (query: string) =>
    apiClient.get('/groups/search', { params: { q: query } }).then((r) => r.data),

  autocomplete: (query: string) =>
    apiClient.get('/groups/autocomplete', { params: { q: query } }).then((r) => r.data),

  getGroup: (id: string) =>
    apiClient.get(`/groups/${id}`).then((r) => r.data),

  getMyGroups: () =>
    apiClient.get('/groups/my').then((r) => r.data),

  createGroup: (name: string, description: string, privacy: 'public' | 'private') =>
    apiClient.post('/groups', { name, description, privacy }).then((r) => r.data),

  joinGroup: (id: string) =>
    apiClient.post(`/groups/${id}/join`).then((r) => r.data),

  leaveGroup: (id: string) =>
    apiClient.delete(`/groups/${id}/leave`).then((r) => r.data),

  deleteGroup: (id: string) =>
    apiClient.delete(`/groups/${id}`).then((r) => r.data),
};
