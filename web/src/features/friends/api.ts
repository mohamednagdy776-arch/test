import { apiClient } from '@/lib/api-client';

export const friendsApi = {
  sendRequest: (userId: string) =>
    apiClient.post('/friends/request', { userId }).then(r => r.data),

  acceptRequest: (requestId: string) =>
    apiClient.post(`/friends/request/${requestId}/accept`).then(r => r.data),

  declineRequest: (requestId: string) =>
    apiClient.post(`/friends/request/${requestId}/decline`).then(r => r.data),

  cancelRequest: (requestId: string) =>
    apiClient.delete(`/friends/request/${requestId}`).then(r => r.data),

  getFriends: (page = 1, limit = 20) =>
    apiClient.get('/friends/list', { params: { page, limit } }).then(r => r.data),

  getPendingRequests: () =>
    apiClient.get('/friends/requests').then(r => r.data),

  getSentRequests: () =>
    apiClient.get('/friends/requests/sent').then(r => r.data),

  getSuggestions: (limit = 10) =>
    apiClient.get('/friends/suggestions', { params: { limit } }).then(r => r.data),

  getFriendshipStatus: (userId: string) =>
    apiClient.get(`/friends/status/${userId}`).then(r => r.data),

  unfriend: (userId: string) =>
    apiClient.delete(`/friends/${userId}`).then(r => r.data),

  blockUser: (userId: string) =>
    apiClient.post('/friends/block', { userId }).then(r => r.data),

  unblockUser: (userId: string) =>
    apiClient.delete(`/friends/block/${userId}`).then(r => r.data),

  restrictUser: (userId: string, restrictPosts = true, restrictMessages = true) =>
    apiClient.post('/friends/restrict', { userId, restrictPosts, restrictMessages }).then(r => r.data),

  unrestrictUser: (userId: string) =>
    apiClient.delete(`/friends/restrict/${userId}`).then(r => r.data),

  getFriendLists: () =>
    apiClient.get('/friends/lists').then(r => r.data),

  createFriendList: (name: string, type?: string) =>
    apiClient.post('/friends/lists', { name, type }).then(r => r.data),

  updateFriendList: (listId: string, data: { name?: string; memberIds?: string[] }) =>
    apiClient.patch(`/friends/lists/${listId}`, data).then(r => r.data),

  deleteFriendList: (listId: string) =>
    apiClient.delete(`/friends/lists/${listId}`).then(r => r.data),

  follow: (userId: string) =>
    apiClient.post(`/friends/follow/${userId}`).then(r => r.data),

  unfollow: (userId: string) =>
    apiClient.delete(`/friends/follow/${userId}`).then(r => r.data),
};