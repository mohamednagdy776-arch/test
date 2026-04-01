'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from './api';

export function useFeed(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['feed', page],
    queryFn: () => postsApi.getFeed(page, limit),
  });
}

export function useGroupPosts(groupId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['group-posts', groupId, page],
    queryFn: () => postsApi.getGroupPosts(groupId, page, limit),
    enabled: !!groupId,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, content, mediaUrl, mediaType }: { groupId: string; content: string; mediaUrl?: string; mediaType?: string }) =>
      postsApi.createPost(groupId, content, mediaUrl, mediaType),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: ['group-posts'] });
    },
  });
}

export function useCreatePostWithMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, content, file }: { groupId: string; content: string; file: File }) =>
      postsApi.createPostWithMedia(groupId, content, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: ['group-posts'] });
    },
  });
}

export function useComments(postId: string) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => postsApi.getComments(postId),
    enabled: !!postId,
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, content, parentId }: { postId: string; content: string; parentId?: string }) =>
      postsApi.addComment(postId, content, parentId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['comments', variables.postId] });
    },
  });
}

export function useReactions(postId: string) {
  return useQuery({
    queryKey: ['reactions', postId],
    queryFn: () => postsApi.getReactions(postId),
    enabled: !!postId,
  });
}

export function useToggleReaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: string }) =>
      postsApi.toggleReaction(postId, type),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['reactions', variables.postId] });
    },
  });
}
