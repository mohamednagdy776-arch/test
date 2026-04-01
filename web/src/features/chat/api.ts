import { apiClient } from '@/lib/api-client';

export const chatApi = {
  getMessages: (matchId: string, page = 1, limit = 50) =>
    apiClient.get(`/chat/${matchId}/messages`, { params: { page, limit } }).then((r) => r.data),

  sendMessage: (matchId: string, content: string) =>
    apiClient.post('/chat/messages', { matchId, content }).then((r) => r.data),

  createConversation: (targetUserId: string) =>
    apiClient.post('/chat/conversations', { targetUserId }).then((r) => r.data),
};
