import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from './api';

export const useComments = (page = 1) =>
  useQuery({ queryKey: ['comments', page], queryFn: () => commentsApi.getAll(page) });

export const useDeleteComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: commentsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments'] }),
  });
};
