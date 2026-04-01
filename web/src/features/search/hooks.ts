'use client';
import { useQuery } from '@tanstack/react-query';
import { searchApi, type SearchParams } from './api';

export function useSearchUsers(params: SearchParams) {
  return useQuery({
    queryKey: ['search-users', params],
    queryFn: () => searchApi.searchUsers(params),
    enabled: Object.values(params).some((v) => v !== undefined && v !== ''),
  });
}

export function useUserProfile(id: string) {
  return useQuery({
    queryKey: ['user-profile', id],
    queryFn: () => searchApi.getUserProfile(id),
    enabled: !!id,
  });
}
