'use client';
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi, storiesApi } from './api';

export function useFeed(cursor?: string, limit = 10) {
  return useInfiniteQuery({
    queryKey: ['feed', limit],
    queryFn: ({ pageParam }) => postsApi.getFeed(pageParam, limit),
    getNextPageParam: (lastPage) => lastPage.pagination?.cursor || undefined,
    initialPageParam: undefined as string | undefined,
  });
}

export function useRecentFeed(cursor?: string, limit = 10) {
  return useInfiniteQuery({
    queryKey: ['feed-recent', limit],
    queryFn: ({ pageParam }) => postsApi.getRecentFeed(pageParam, limit),
    getNextPageParam: (lastPage) => lastPage.pagination?.cursor || undefined,
    initialPageParam: undefined as string | undefined,
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
    mutationFn: ({ groupId, content, mediaUrl, mediaType, bgColor, feeling, location, audience, scheduledAt, pollOptions, postType }: { groupId: string; content: string; mediaUrl?: string; mediaType?: string; bgColor?: string; feeling?: string; location?: string; audience?: string; scheduledAt?: string; pollOptions?: { text: string; votes: number }[]; postType?: string }) =>
      postsApi.createPost(groupId, { content, mediaUrl, mediaType, bgColor, feeling, location, audience, scheduledAt, pollOptions, postType }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: ['feed-recent'] });
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
      qc.invalidateQueries({ queryKey: ['feed-recent'] });
      qc.invalidateQueries({ queryKey: ['group-posts'] });
    },
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: any }) => postsApi.updatePost(postId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: ['feed-recent'] });
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => postsApi.deletePost(postId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: ['feed-recent'] });
    },
  });
}

export function useSharePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content?: string }) => postsApi.sharePost(postId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: ['feed-recent'] });
    },
  });
}

export function useSavePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => postsApi.savePost(postId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved-posts'] });
    },
  });
}

export function useReportPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, reason, description }: { postId: string; reason: string; description?: string }) => postsApi.reportPost(postId, reason, description),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useHidePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, hideType, snoozeDays }: { postId: string; hideType: string; snoozeDays?: number }) => postsApi.hidePost(postId, hideType, snoozeDays),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: ['feed-recent'] });
    },
  });
}

export function useSavedPosts(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['saved-posts', page],
    queryFn: () => postsApi.getSavedPosts(page, limit),
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

export function useStories() {
  return useQuery({
    queryKey: ['stories'],
    queryFn: () => storiesApi.getStories(),
  });
}

export function useCreateStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => storiesApi.createStory(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stories'] });
    },
  });
}

export function useDeleteStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (storyId: string) => storiesApi.deleteStory(storyId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stories'] });
    },
  });
}

export function useUploadMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => postsApi.uploadMedia(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useViewStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (storyId: string) => storiesApi.viewStory(storyId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['story-viewers'] });
    },
  });
}

export function useStoryViewers(storyId: string) {
  return useQuery({
    queryKey: ['story-viewers', storyId],
    queryFn: () => storiesApi.getStoryViewers(storyId),
    enabled: !!storyId,
  });
}

export function useAddToHighlight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ storyId, name }: { storyId: string; name: string }) => storiesApi.addToHighlight(storyId, name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['highlights'] });
    },
  });
}

export function useHighlights() {
  return useQuery({
    queryKey: ['highlights'],
    queryFn: () => storiesApi.getHighlights(),
  });
}