import { apiClient } from '@/lib/api-client';

export const profileApi = {
  getMyProfile: () =>
    apiClient.get('/users/me').then((r) => r.data),

  updateProfile: (data: Record<string, any>) =>
    apiClient.patch('/users/me', data).then((r) => r.data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  uploadCover: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/users/me/cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  getUserProfile: (userId: string) =>
    apiClient.get(`/users/${userId}`).then((r) => r.data),

  getFriends: (userId: string, page = 1, limit = 20) =>
    apiClient.get(`/users/${userId}/friends`, { params: { page, limit } }).then((r) => r.data),

  getPhotos: (userId: string, page = 1, limit = 20) =>
    apiClient.get(`/users/${userId}/photos`, { params: { page, limit } }).then((r) => r.data),

  getVideos: (userId: string, page = 1, limit = 20) =>
    apiClient.get(`/users/${userId}/videos`, { params: { page, limit } }).then((r) => r.data),

  getActivityLog: (userId: string, params: Record<string, any> = {}) =>
    apiClient.get(`/users/${userId}/activity`, { params }).then((r) => r.data),

  getFriendshipStatus: (userId: string) =>
    apiClient.get(`/friends/status/${userId}`).then((r) => r.data),

  sendFriendRequest: (userId: string) =>
    apiClient.post('/friends/request', { userId }).then((r) => r.data),

  cancelFriendRequest: (requestId: string) =>
    apiClient.delete(`/friends/request/${requestId}`).then((r) => r.data),

  acceptFriendRequest: (requestId: string) =>
    apiClient.post(`/friends/request/${requestId}/accept`).then((r) => r.data),

  unfriend: (userId: string) =>
    apiClient.delete(`/friends/${userId}`).then((r) => r.data),
};
