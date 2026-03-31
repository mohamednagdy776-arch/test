import { useMutation } from '@tanstack/react-query';
import { chatApi } from './api';
import type { Conversation } from '@/types';

export function useCreateConversation() {
  return useMutation<Conversation, Error, string>({
    mutationFn: (targetUserId: string) =>
      chatApi.createConversation(targetUserId).then((res) => res.data),
  });
}
