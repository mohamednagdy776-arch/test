import { apiClient } from '@/lib/api-client';

export const postsApi = {
  getFeed: (page = 1, limit = 20) =>
    apiClient.get('/feed', { params: { page, limit } }).then((r) => r.data),

  getGroupPosts: (groupId: string, page = 1, limit = 20) =>
    apiClient.get(`/groups/${groupId}/posts`, { params: { page, limit } }).then((r) => r.data),

  createPost: (groupId: string, content: string, mediaUrl?: string, mediaType?: string) =>
    apiClient.post(`/groups/${groupId}/posts`, { content, mediaUrl, mediaType }).then((r) => r.data),

  createPostWithMedia: (groupId: string, content: string, file: File) => {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('file', file);
    return apiClient.post(`/groups/${groupId}/posts/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

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
