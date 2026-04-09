import { apiClient } from '@/lib/api-client';

export const commentsApi = {
  getComments: (postId: string) =>
    apiClient.get(`/posts/${postId}/comments`).then(r => r.data),

  addComment: (postId: string, content: string, parentId?: string) =>
    apiClient.post(`/posts/${postId}/comments`, { content, parentId }).then(r => r.data),

  updateComment: (postId: string, commentId: string, content: string) =>
    apiClient.patch(`/posts/${postId}/comments/${commentId}`, { content }).then(r => r.data),

  deleteComment: (postId: string, commentId: string) =>
    apiClient.delete(`/posts/${postId}/comments/${commentId}`).then(r => r.data),

  pinComment: (postId: string, commentId: string, isPinned: boolean) =>
    apiClient.post(`/posts/${postId}/comments/${commentId}/pin`, { isPinned }).then(r => r.data),

  getReactions: (postId: string, commentId: string) =>
    apiClient.get(`/posts/${postId}/comments/${commentId}/reactions`).then(r => r.data),

  addReaction: (postId: string, commentId: string, type: string) =>
    apiClient.post(`/posts/${postId}/comments/${commentId}/reactions`, { type }).then(r => r.data),

  getMyReaction: (postId: string, commentId: string) =>
    apiClient.get(`/posts/${postId}/comments/${commentId}/reactions/me`).then(r => r.data),
};
