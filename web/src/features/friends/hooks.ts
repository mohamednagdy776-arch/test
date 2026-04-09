'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { friendsApi } from './api';

export function useFriends(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['friends', page],
    queryFn: () => friendsApi.getFriends(page, limit),
  });
}

export function usePendingRequests() {
  return useQuery({
    queryKey: ['friend-requests'],
    queryFn: () => friendsApi.getPendingRequests(),
  });
}

export function useSentRequests() {
  return useQuery({
    queryKey: ['sent-requests'],
    queryFn: () => friendsApi.getSentRequests(),
  });
}

export function useSuggestions(limit = 10) {
  return useQuery({
    queryKey: ['friend-suggestions', limit],
    queryFn: () => friendsApi.getSuggestions(limit),
  });
}

export function useFriendshipStatus(userId: string) {
  return useQuery({
    queryKey: ['friendship-status', userId],
    queryFn: () => friendsApi.getFriendshipStatus(userId),
    enabled: !!userId,
  });
}

export function useSendFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => friendsApi.sendRequest(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friend-requests'] });
      qc.invalidateQueries({ queryKey: ['sent-requests'] });
      qc.invalidateQueries({ queryKey: ['friendship-status'] });
    },
  });
}

export function useAcceptFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => friendsApi.acceptRequest(requestId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friend-requests'] });
      qc.invalidateQueries({ queryKey: ['friends'] });
    },
  });
}

export function useDeclineFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => friendsApi.declineRequest(requestId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friend-requests'] });
    },
  });
}

export function useCancelFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => friendsApi.cancelRequest(requestId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sent-requests'] });
    },
  });
}

export function useUnfriend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => friendsApi.unfriend(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friends'] });
      qc.invalidateQueries({ queryKey: ['friendship-status'] });
    },
  });
}

export function useBlockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => friendsApi.blockUser(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friends'] });
      qc.invalidateQueries({ queryKey: ['friend-requests'] });
    },
  });
}

export function useUnblockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => friendsApi.unblockUser(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friendship-status'] });
    },
  });
}

export function useRestrictUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, restrictPosts = true, restrictMessages = true }: { userId: string; restrictPosts?: boolean; restrictMessages?: boolean }) =>
      friendsApi.restrictUser(userId, restrictPosts, restrictMessages),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friendship-status'] });
    },
  });
}

export function useUnrestrictUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => friendsApi.unrestrictUser(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friendship-status'] });
    },
  });
}

export function useFollowUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => friendsApi.follow(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friendship-status'] });
    },
  });
}

export function useUnfollowUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => friendsApi.unfollow(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friendship-status'] });
    },
  });
}

export function useFriendLists() {
  return useQuery({
    queryKey: ['friend-lists'],
    queryFn: () => friendsApi.getFriendLists(),
  });
}

export function useCreateFriendList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, type }: { name: string; type?: string }) => friendsApi.createFriendList(name, type),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friend-lists'] });
    },
  });
}

export function useUpdateFriendList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, data }: { listId: string; data: { name?: string; memberIds?: string[] } }) =>
      friendsApi.updateFriendList(listId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friend-lists'] });
    },
  });
}

export function useDeleteFriendList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (listId: string) => friendsApi.deleteFriendList(listId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friend-lists'] });
    },
  });
}