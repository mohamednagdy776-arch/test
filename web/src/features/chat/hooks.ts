'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from './api';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatApi.getConversations(),
  });
}

export function useMessages(conversationId: string, page = 1, limit = 50) {
  return useQuery({
    queryKey: ['messages', conversationId, page],
    queryFn: () => chatApi.getMessages(conversationId, page, limit),
    enabled: !!conversationId,
    refetchInterval: 5000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['chat-unread'],
    queryFn: () => chatApi.getUnreadCount(),
    refetchInterval: 30000,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, content, type, replyToId, mediaUrl }: { conversationId: string; content: string; type?: string; replyToId?: string; mediaUrl?: string }) =>
      chatApi.sendMessage(conversationId, content, type, replyToId, mediaUrl),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useEditMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
      chatApi.editMessage(messageId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useDeleteMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, forEveryone }: { messageId: string; forEveryone?: boolean }) =>
      chatApi.deleteMessage(messageId, forEveryone),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useSearchMessages(conversationId: string, query: string) {
  return useQuery({
    queryKey: ['message-search', conversationId, query],
    queryFn: () => chatApi.searchMessages(conversationId, query),
    enabled: !!conversationId && !!query,
  });
}

export function useAddReaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      chatApi.addReaction(messageId, emoji),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useStarMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => chatApi.starMessage(messageId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useForwardMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, conversationId }: { messageId: string; conversationId: string }) =>
      chatApi.forwardMessage(messageId, conversationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages'] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, participantIds }: { name: string; participantIds: string[] }) =>
      chatApi.createGroup(name, participantIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useLeaveGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => chatApi.leaveGroup(conversationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useMuteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, duration }: { conversationId: string; duration: number }) =>
      chatApi.muteGroup(conversationId, duration),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useCreateConversation() {
  return useMutation({
    mutationFn: (targetUserId: string) => chatApi.createConversation(targetUserId),
  });
}
