import { apiClient } from '@/lib/api-client';

export const chatApi = {
  // Conversations
  getConversations: () =>
    apiClient.get('/chat/conversations').then(r => r.data),

  getMessages: (conversationId: string, page = 1, limit = 50) =>
    apiClient.get(`/chat/conversations/${conversationId}/messages`, { params: { page, limit } }).then(r => r.data),

  getUnreadCount: () =>
    apiClient.get('/chat/unread').then(r => r.data),

  // Messages
  sendMessage: (conversationId: string, content: string, type = 'text', replyToId?: string, mediaUrl?: string) =>
    apiClient.post('/chat/messages', { conversationId, content, type, replyToId, mediaUrl }).then(r => r.data),

  editMessage: (messageId: string, content: string) =>
    apiClient.put(`/chat/messages/${messageId}`, { content }).then(r => r.data),

  deleteMessage: (messageId: string, forEveryone = false) =>
    apiClient.delete(`/chat/messages/${messageId}`, { data: { forEveryone } }).then(r => r.data),

  searchMessages: (conversationId: string, query: string) =>
    apiClient.get(`/chat/messages/${conversationId}/search`, { params: { query } }).then(r => r.data),

  // Reactions
  addReaction: (messageId: string, emoji: string) =>
    apiClient.post(`/chat/messages/${messageId}/reactions`, { emoji }).then(r => r.data),

  removeReaction: (messageId: string) =>
    apiClient.delete(`/chat/messages/${messageId}/reactions`).then(r => r.data),

  // Star messages
  starMessage: (messageId: string) =>
    apiClient.post(`/chat/messages/${messageId}/star`).then(r => r.data),

  // Forward
  forwardMessage: (messageId: string, conversationId: string) =>
    apiClient.post(`/chat/messages/${messageId}/forward`, { conversationId }).then(r => r.data),

  // Groups
  createGroup: (name: string, participantIds: string[]) =>
    apiClient.post('/chat/groups', { name, participantIds }).then(r => r.data),

  updateGroup: (conversationId: string, data: { name?: string; avatar?: string }) =>
    apiClient.put(`/chat/groups/${conversationId}`, data).then(r => r.data),

  addGroupParticipant: (conversationId: string, userId: string) =>
    apiClient.post(`/chat/groups/${conversationId}/participants`, { userId }).then(r => r.data),

  removeGroupParticipant: (conversationId: string, userId: string) =>
    apiClient.delete(`/chat/groups/${conversationId}/participants/${userId}`).then(r => r.data),

  updateGroupRole: (conversationId: string, userId: string, role: 'admin' | 'member') =>
    apiClient.put(`/chat/groups/${conversationId}/participants/${userId}/role`, { role }).then(r => r.data),

  leaveGroup: (conversationId: string) =>
    apiClient.post(`/chat/groups/${conversationId}/leave`).then(r => r.data),

  muteGroup: (conversationId: string, duration: number) =>
    apiClient.post(`/chat/groups/${conversationId}/mute`, { duration }).then(r => r.data),

  unmuteGroup: (conversationId: string) =>
    apiClient.post(`/chat/groups/${conversationId}/unmute`).then(r => r.data),

  // Disappearing messages
  setDisappearingMessages: (conversationId: string, duration: '24h' | '7d' | '90d' | null) =>
    apiClient.post(`/chat/groups/${conversationId}/disappearing`, { duration }).then(r => r.data),

  // Create conversation
  createConversation: (targetUserId: string) =>
    apiClient.post('/chat/conversations', { targetUserId }).then(r => r.data),
};
