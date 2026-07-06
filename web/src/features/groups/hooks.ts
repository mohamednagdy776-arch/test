'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from './api';

export function useGroups(page = 1, limit = 20, category?: string) {
  return useQuery({
    queryKey: ['groups', page, category],
    queryFn: () => groupsApi.getGroups(page, limit, category),
  });
}

export function usePublicGroups(page = 1, limit = 20, category?: string) {
  return useQuery({
    queryKey: ['public-groups', page, category],
    queryFn: () => groupsApi.getPublicGroups(page, limit, category),
  });
}

export function usePrivateGroups(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['private-groups', page],
    queryFn: () => groupsApi.getPrivateGroups(page, limit),
  });
}

export function useSearchGroups(query: string) {
  return useQuery({
    queryKey: ['groups-search', query],
    queryFn: () => groupsApi.searchGroups(query),
    enabled: query.trim().length >= 2,
  });
}

export function useGroupAutocomplete(query: string) {
  return useQuery({
    queryKey: ['groups-autocomplete', query],
    queryFn: () => groupsApi.autocomplete(query),
    enabled: query.trim().length >= 1,
  });
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: ['group', id],
    queryFn: () => groupsApi.getGroup(id),
  });
}

export function useMyGroups() {
  return useQuery({
    queryKey: ['my-groups'],
    queryFn: () => groupsApi.getMyGroups(),
  });
}

export function useSuggestedGroups(limit = 5) {
  return useQuery({
    queryKey: ['suggested-groups', limit],
    queryFn: () => groupsApi.getSuggestedGroups(limit),
  });
}

export function usePendingRequests() {
  return useQuery({
    queryKey: ['pending-requests'],
    queryFn: () => groupsApi.getPendingRequests(),
  });
}

export function useJoinGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => groupsApi.joinGroup(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['my-groups'] });
      qc.invalidateQueries({ queryKey: ['groups'] });
      qc.invalidateQueries({ queryKey: ['groups-search'] });
      qc.invalidateQueries({ queryKey: ['public-groups'] });
      qc.invalidateQueries({ queryKey: ['private-groups'] });
      qc.invalidateQueries({ queryKey: ['suggested-groups'] });
      // Refresh the pending-requests list/badge and the open detail page so a
      // private-group join request shows as "pending" immediately (#36).
      qc.invalidateQueries({ queryKey: ['pending-requests'] });
      qc.invalidateQueries({ queryKey: ['group', id] });
    },
  });
}

export function useLeaveGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => groupsApi.leaveGroup(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['my-groups'] });
      qc.invalidateQueries({ queryKey: ['groups'] });
      qc.invalidateQueries({ queryKey: ['groups-search'] });
      qc.invalidateQueries({ queryKey: ['public-groups'] });
      qc.invalidateQueries({ queryKey: ['private-groups'] });
      qc.invalidateQueries({ queryKey: ['suggested-groups'] });
      // Refresh the detail page so isMember flips and the UI updates without a
      // manual reload (#35).
      qc.invalidateQueries({ queryKey: ['group', id] });
    },
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, description, privacy, category, coverPhoto }: { name: string; description: string; privacy: 'public' | 'private' | 'secret'; category?: string; coverPhoto?: File }) =>
      coverPhoto ? groupsApi.createGroupWithCover(name, description, privacy, category || '', coverPhoto) : groupsApi.createGroup(name, description, privacy, category),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-groups'] });
      qc.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => groupsApi.deleteGroup(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-groups'] });
      qc.invalidateQueries({ queryKey: ['groups'] });
      qc.invalidateQueries({ queryKey: ['public-groups'] });
    },
  });
}

export function useUpdateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string; category?: string; location?: string; rules?: string } }) =>
      groupsApi.updateGroup(id, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['group', id] });
    },
  });
}

export function useGroupMembers(id: string, page = 1, limit = 50) {
  return useQuery({
    queryKey: ['group-members', id, page],
    queryFn: () => groupsApi.getMembers(id, page, limit),
    enabled: !!id,
  });
}

export function useBanMember(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => groupsApi.banMember(groupId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['group-members', groupId] }),
  });
}

export function useUnbanMember(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => groupsApi.unbanMember(groupId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['group-members', groupId] }),
  });
}
