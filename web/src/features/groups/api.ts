import { apiClient } from '@/lib/api-client';

export const groupsApi = {
  getGroups: (page = 1, limit = 20, category?: string) =>
    apiClient.get('/groups', { params: { page, limit, category } }).then((r) => r.data),

  getPublicGroups: (page = 1, limit = 20, category?: string) =>
    apiClient.get('/groups/public', { params: { page, limit, category } }).then((r) => r.data),

  getPrivateGroups: (page = 1, limit = 20) =>
    apiClient.get('/groups/private', { params: { page, limit } }).then((r) => r.data),

  searchGroups: (query: string) =>
    apiClient.get('/groups/search', { params: { q: query } }).then((r) => r.data),

  autocomplete: (query: string) =>
    apiClient.get('/groups/autocomplete', { params: { q: query } }).then((r) => r.data),

  getGroup: (id: string) =>
    apiClient.get(`/groups/${id}`).then((r) => r.data),

  getMyGroups: () =>
    apiClient.get('/groups/my').then((r) => r.data),

  getSuggestedGroups: (limit = 5) =>
    apiClient.get('/groups/suggested', { params: { limit } }).then((r) => r.data),

  getPendingRequests: () =>
    apiClient.get('/groups/pending').then((r) => r.data),

  createGroup: (name: string, description: string, privacy: 'public' | 'private' | 'secret', category?: string) =>
    apiClient.post('/groups', { name, description, privacy, category }).then((r) => r.data),

  createGroupWithCover: (name: string, description: string, privacy: 'public' | 'private' | 'secret', category: string, coverPhoto: File) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('privacy', privacy);
    formData.append('category', category);
    formData.append('coverPhoto', coverPhoto);
    return apiClient.post('/groups', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  joinGroup: (id: string) =>
    apiClient.post(`/groups/${id}/join`).then((r) => r.data),

  leaveGroup: (id: string) =>
    apiClient.delete(`/groups/${id}/leave`).then((r) => r.data),

  deleteGroup: (id: string) =>
    apiClient.delete(`/groups/${id}`).then((r) => r.data),
};
