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

  // Comments
  getComments: (postId: string) =>
    apiClient.get(`/posts/${postId}/comments`).then((r) => r.data),

  addComment: (postId: string, content: string, parentId?: string) =>
    apiClient.post(`/posts/${postId}/comments`, { content, parentId }).then((r) => r.data),

  // Reactions
  getReactions: (postId: string) =>
    apiClient.get(`/posts/${postId}/reactions`).then((r) => r.data),

  toggleReaction: (postId: string, type: string) =>
    apiClient.post(`/posts/${postId}/reactions`, { type }).then((r) => r.data),
};
