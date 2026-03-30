import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from './api';

export const usePosts = (page = 1) =>
  useQuery({ queryKey: ['posts', page], queryFn: () => postsApi.getAll(page) });

export const useDeletePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });
};
