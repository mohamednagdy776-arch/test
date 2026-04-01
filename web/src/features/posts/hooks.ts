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
    mutationFn: ({ groupId, content, mediaUrl }: { groupId: string; content: string; mediaUrl?: string }) =>
      postsApi.createPost(groupId, content, mediaUrl),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: ['group-posts'] });
    },
  });
}
