import { apiClient } from '@/lib/api-client';
import type { ApiResponse, Conversation } from '@/types';

export const chatApi = {
  createConversation: (targetUserId: string) =>
    apiClient.post<ApiResponse<Conversation>>('/chat/conversations', { targetUserId }).then((r) => r.data),
};
