'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { followsApi } from './api';

export function useFollowStatus(userId?: string) {
  return useQuery({
    queryKey: ['follow-status', userId],
    queryFn: () => followsApi.status(userId!),
    enabled: !!userId,
  });
}

export function useFollowCounts(userId?: string) {
  return useQuery({
    queryKey: ['follow-counts', userId],
    queryFn: () => followsApi.counts(userId!),
    enabled: !!userId,
  });
}

export function useFollowers(userId?: string, search?: string) {
  return useQuery({
    queryKey: ['followers', userId, search ?? ''],
    queryFn: () => followsApi.followers(userId!, 1, 50, search || undefined),
    enabled: !!userId,
  });
}

export function useFollowing(userId?: string, search?: string) {
  return useQuery({
    queryKey: ['following', userId, search ?? ''],
    queryFn: () => followsApi.following(userId!, 1, 50, search || undefined),
    enabled: !!userId,
  });
}

export function useToggleFollow(userId?: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['follow-status', userId] });
    qc.invalidateQueries({ queryKey: ['follow-counts', userId] });
  };
  const follow = useMutation({ mutationFn: () => followsApi.follow(userId!), onSuccess: invalidate });
  const unfollow = useMutation({ mutationFn: () => followsApi.unfollow(userId!), onSuccess: invalidate });
  return { follow, unfollow };
}
