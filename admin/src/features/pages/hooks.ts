import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pagesApi } from './api';

export const usePages = (page = 1) =>
  useQuery({ queryKey: ['pages', page], queryFn: () => pagesApi.getAll(page) });

export const useDeletePage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: pagesApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pages'] }),
  });
};

export const useVerifyPage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: pagesApi.verify,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pages'] }),
  });
};
