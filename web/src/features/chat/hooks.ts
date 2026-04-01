'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from './api';

export function useMessages(matchId: string) {
  return useQuery({
    queryKey: ['messages', matchId],
    queryFn: () => chatApi.getMessages(matchId),
    enabled: !!matchId,
    refetchInterval: 5000,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ matchId, content }: { matchId: string; content: string }) =>
      chatApi.sendMessage(matchId, content),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['messages', variables.matchId] });
    },
  });
}

export function useCreateConversation() {
  return useMutation({
    mutationFn: (targetUserId: string) => chatApi.createConversation(targetUserId),
  });
}
