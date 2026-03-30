import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from './api';

export const useUsers = (page = 1) =>
  useQuery({ queryKey: ['users', page], queryFn: () => usersApi.getAll(page) });

export const useUser = (id: string) =>
  useQuery({ queryKey: ['users', id], queryFn: () => usersApi.getById(id), enabled: !!id });

export const useBanUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.ban,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useUnbanUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.unban,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
};
