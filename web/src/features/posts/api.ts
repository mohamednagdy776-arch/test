import { apiClient } from '@/lib/api-client';

export const postsApi = {
  getFeed: (page = 1, limit = 20) =>
    apiClient.get('/feed', { params: { page, limit } }).then((r) => r.data),

  getGroupPosts: (groupId: string, page = 1, limit = 20) =>
    apiClient.get(`/groups/${groupId}/posts`, { params: { page, limit } }).then((r) => r.data),

  createPost: (groupId: string, content: string, mediaUrl?: string) =>
    apiClient.post(`/groups/${groupId}/posts`, { content, mediaUrl }).then((r) => r.data),

  deletePost: (groupId: string, postId: string) =>
    apiClient.delete(`/groups/${groupId}/posts/${postId}`).then((r) => r.data),
};
