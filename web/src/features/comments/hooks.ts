'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from './api';

export function useComments(postId: string) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => commentsApi.getComments(postId),
    enabled: !!postId,
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, content, parentId }: { postId: string; content: string; parentId?: string }) =>
      commentsApi.addComment(postId, content, parentId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['comments', variables.postId] });
    },
  });
}

export function useUpdateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, commentId, content }: { postId: string; commentId: string; content: string }) =>
      commentsApi.updateComment(postId, commentId, content),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['comments', variables.postId] });
    },
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, commentId }: { postId: string; commentId: string }) =>
      commentsApi.deleteComment(postId, commentId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['comments', variables.postId] });
    },
  });
}

export function usePinComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, commentId, isPinned }: { postId: string; commentId: string; isPinned: boolean }) =>
      commentsApi.pinComment(postId, commentId, isPinned),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['comments', variables.postId] });
    },
  });
}

export function useCommentReactions(postId: string, commentId: string) {
  return useQuery({
    queryKey: ['comment-reactions', postId, commentId],
    queryFn: () => commentsApi.getReactions(postId, commentId),
    enabled: !!postId && !!commentId,
  });
}

export function useAddCommentReaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, commentId, type }: { postId: string; commentId: string; type: string }) =>
      commentsApi.addReaction(postId, commentId, type),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['comment-reactions', variables.postId, variables.commentId] });
    },
  });
}
