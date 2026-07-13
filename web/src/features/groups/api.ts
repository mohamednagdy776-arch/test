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

  updateGroup: (id: string, data: { name?: string; description?: string; category?: string; location?: string; rules?: string }) =>
    apiClient.patch(`/groups/${id}`, data).then((r) => r.data),

  getMembers: (id: string, page = 1, limit = 50) =>
    apiClient.get(`/groups/${id}/members`, { params: { page, limit } }).then((r) => r.data),

  // No invite mechanism existed at all -- secret groups are invite-only and
  // aren't discoverable, so there was no way to grow one past its creator (#299).
  inviteMember: (id: string, userId: string) =>
    apiClient.post(`/groups/${id}/members/${userId}/invite`).then((r) => r.data),

  banMember: (id: string, userId: string) =>
    apiClient.post(`/groups/${id}/members/${userId}/ban`).then((r) => r.data),

  unbanMember: (id: string, userId: string) =>
    apiClient.post(`/groups/${id}/members/${userId}/unban`).then((r) => r.data),

  approveJoinRequest: (id: string, userId: string) =>
    apiClient.post(`/groups/${id}/members/${userId}/approve`).then((r) => r.data),

  rejectJoinRequest: (id: string, userId: string) =>
    apiClient.post(`/groups/${id}/members/${userId}/reject`).then((r) => r.data),
};
