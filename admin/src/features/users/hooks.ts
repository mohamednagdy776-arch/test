'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from './api';
import type { SearchParams } from '@/types';

export function useUsers(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['users', page],
    queryFn: () => usersApi.getUsers(page, limit),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getUser(id),
    enabled: !!id,
  });
}

export function useSearchUsers(params: SearchParams) {
  return useQuery({
    queryKey: ['search-users', params],
    queryFn: () => usersApi.searchUsers(params),
    enabled: !!params && (params.name ? params.name.length >= 2 : true),
  });
}

export function useUserProfile(id: string) {
  return useQuery({
    queryKey: ['user-profile', id],
    queryFn: () => usersApi.getUserProfile(id),
    enabled: !!id,
  });
}

export function useBanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.banUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUnbanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.unbanUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}
