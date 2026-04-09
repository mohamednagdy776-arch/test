import { apiClient } from '@/lib/api-client';

export const postsApi = {
  searchPosts: (query: string, cursor?: string, limit = 10) =>
    apiClient.get('/posts/search', { params: { q: query, cursor, limit } }).then((r) => r.data),

  getFeed: (cursor?: string, limit = 10) =>
    apiClient.get('/feed', { params: { cursor, limit } }).then((r) => r.data),

  getRecentFeed: (cursor?: string, limit = 10) =>
    apiClient.get('/feed/recent', { params: { cursor, limit } }).then((r) => r.data),

  getGroupPosts: (groupId: string, page = 1, limit = 20) =>
    apiClient.get(`/groups/${groupId}/posts`, { params: { page, limit } }).then((r) => r.data),

  createPost: (groupId: string, data: any) =>
    apiClient.post(`/posts`, data).then((r) => r.data),

  createPostWithMedia: (groupId: string, content: string, file: File) => {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('file', file);
    return apiClient.post(`/groups/${groupId}/posts/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  deletePost: (postId: string) =>
    apiClient.delete(`/posts/${postId}`).then((r) => r.data),

  updatePost: (postId: string, data: any) =>
    apiClient.patch(`/posts/${postId}`, data).then((r) => r.data),

  getPost: (postId: string) =>
    apiClient.get(`/posts/${postId}`).then((r) => r.data),

  sharePost: (postId: string, content?: string) =>
    apiClient.post(`/posts/${postId}/share`, { content }).then((r) => r.data),

  savePost: (postId: string) =>
    apiClient.post(`/posts/${postId}/save`).then((r) => r.data),

  reportPost: (postId: string, reason: string, description?: string) =>
    apiClient.post(`/posts/${postId}/report`, { reason, description }).then((r) => r.data),

  hidePost: (postId: string, hideType: string, snoozeDays?: number) =>
    apiClient.post(`/posts/${postId}/hide`, { hideType, snoozeDays }).then((r) => r.data),

  getSavedPosts: (page = 1, limit = 10) =>
    apiClient.get('/posts/saved', { params: { page, limit } }).then((r) => r.data),

  getComments: (postId: string) =>
    apiClient.get(`/posts/${postId}/comments`).then((r) => r.data),

  addComment: (postId: string, content: string, parentId?: string) =>
    apiClient.post(`/posts/${postId}/comments`, { content, parentId }).then((r) => r.data),

  getReactions: (postId: string) =>
    apiClient.get(`/posts/${postId}/reactions`).then((r) => r.data),

  toggleReaction: (postId: string, type: string) =>
    apiClient.post(`/posts/${postId}/reactions`, { type }).then((r) => r.data),

  uploadMedia: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/upload/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
};

export const storiesApi = {
  getStories: () =>
    apiClient.get('/stories').then((r) => r.data),

  createStory: (data: any) =>
    apiClient.post('/stories', data).then((r) => r.data),

  deleteStory: (storyId: string) =>
    apiClient.delete(`/stories/${storyId}`).then((r) => r.data),

  viewStory: (storyId: string) =>
    apiClient.post(`/stories/${storyId}/view`).then((r) => r.data),

  getStoryViewers: (storyId: string) =>
    apiClient.get(`/stories/${storyId}/viewers`).then((r) => r.data),

  addToHighlight: (storyId: string, name: string) =>
    apiClient.post(`/stories/${storyId}/highlights`, { name }).then((r) => r.data),

  getHighlights: () =>
    apiClient.get('/highlights').then((r) => r.data),
};