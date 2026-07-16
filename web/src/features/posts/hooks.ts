'use client';
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi, storiesApi } from './api';
import { savedPostsApi } from '@/features/memories/api';

export function useFeed(cursor?: string, limit = 10) {
  return useInfiniteQuery({
    queryKey: ['feed', limit],
    queryFn: ({ pageParam }) => postsApi.getFeed(pageParam, limit),
    getNextPageParam: (lastPage) => lastPage.pagination?.cursor || undefined,
    initialPageParam: undefined as string | undefined,
  });
}

export function usePost(postId: string) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => postsApi.getPost(postId),
    enabled: !!postId,
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
    mutationFn: ({ groupId, content, mediaUrl, mediaType, mediaUrls, bgColor, feeling, location, audience, scheduledAt, pollOptions, postType, linkUrl, linkTitle, linkDescription, linkImage, noLinkPreview }: { groupId: string; content: string; mediaUrl?: string; mediaType?: string; mediaUrls?: string[]; bgColor?: string; feeling?: string; location?: string; audience?: string; scheduledAt?: string; pollOptions?: { text: string; votes: number }[]; postType?: string; linkUrl?: string; linkTitle?: string; linkDescription?: string; linkImage?: string; noLinkPreview?: boolean }) =>
      postsApi.createPost(groupId, { content, mediaUrl, mediaType, mediaUrls, bgColor, feeling, location, audience, scheduledAt, pollOptions, postType, linkUrl, linkTitle, linkDescription, linkImage, noLinkPreview }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: ['feed-recent'] });
      qc.invalidateQueries({ queryKey: ['group-posts'] });
      qc.invalidateQueries({ queryKey: ['profile-posts'] });
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
      qc.invalidateQueries({ queryKey: ['profile-posts'] });
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
      qc.invalidateQueries({ queryKey: ['profile-posts'] });
    },
  });
}

// Every mutation above only ever invalidated the main-feed query keys -- the
// profile Posts tab (ProfileView.tsx, queryKey ['profile-posts', userId, page])
// never refetched after a delete/edit/share/hide/report, so a successfully
// deleted post stayed visible there until a full page reload (#244).
export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => postsApi.deletePost(postId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: ['feed-recent'] });
      qc.invalidateQueries({ queryKey: ['profile-posts'] });
      // Also missing here (unlike create), so a deleted GROUP post stayed
      // visible in the group's post list until a full page reload (#189).
      qc.invalidateQueries({ queryKey: ['group-posts'] });
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
      qc.invalidateQueries({ queryKey: ['profile-posts'] });
      qc.invalidateQueries({ queryKey: ['group-posts'] });
    },
  });
}

export function useSavePost(callbacks?: { onSuccess?: () => void; onError?: (err: any) => void }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => savedPostsApi.saveItem('post', postId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved-items'] });
      callbacks?.onSuccess?.();
    },
    onError: (err: any) => {
      callbacks?.onError?.(err);
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

// Archive (#416) -- own archived posts only.
export function useArchivedPosts(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['archived-posts', page],
    queryFn: () => postsApi.getArchivedPosts(page, limit),
  });
}

// Toggle-friendly: calling this on an already-archived post unarchives it.
export function useArchivePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => postsApi.archivePost(postId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['archived-posts'] });
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: ['feed-recent'] });
      qc.invalidateQueries({ queryKey: ['profile-posts'] });
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

// Only invalidated its own ['comments', postId] query -- every other place
// that shows a post's commentsCount as a baked-in field on the post object
// itself (main feed, group feed, profile posts, and the dashboard's Trending
// Posts widget, which sums likesCount + commentsCount) kept whatever count it
// last fetched until its own staleTime lapsed or a full reload happened, so
// it visibly disagreed with the live count PostCard renders via useComments/
// useReactions (#429).
export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, content, parentId }: { postId: string; content: string; parentId?: string }) =>
      postsApi.addComment(postId, content, parentId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['comments', variables.postId] });
      qc.invalidateQueries({ queryKey: ['post', variables.postId] });
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: ['feed-recent'] });
      qc.invalidateQueries({ queryKey: ['trending-posts'] });
      qc.invalidateQueries({ queryKey: ['group-posts'] });
      qc.invalidateQueries({ queryKey: ['profile-posts'] });
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

// Same staleness class as useAddComment above, for likesCount instead of
// commentsCount -- reacting to a post only ever refreshed PostCard's own live
// ['reactions', postId] total, never the baked-in likesCount other widgets
// (Trending Posts on the dashboard, main/group feeds, profile posts) compute
// from (#429).
export function useToggleReaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: string }) =>
      postsApi.toggleReaction(postId, type),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['reactions', variables.postId] });
      qc.invalidateQueries({ queryKey: ['post', variables.postId] });
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: ['feed-recent'] });
      qc.invalidateQueries({ queryKey: ['trending-posts'] });
      qc.invalidateQueries({ queryKey: ['group-posts'] });
      qc.invalidateQueries({ queryKey: ['profile-posts'] });
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

export function useReactToStory() {
  return useMutation({
    mutationFn: ({ storyId, emoji }: { storyId: string; emoji: string }) => storiesApi.reactToStory(storyId, emoji),
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

// Archive (#416) -- own archived stories only.
export function useArchivedStories(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['archived-stories', page],
    queryFn: () => storiesApi.getArchivedStories(page, limit),
  });
}

// Toggle-friendly: calling this on an already-archived story unarchives it.
export function useArchiveStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (storyId: string) => storiesApi.archiveStory(storyId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['archived-stories'] });
      qc.invalidateQueries({ queryKey: ['stories'] });
    },
  });
}