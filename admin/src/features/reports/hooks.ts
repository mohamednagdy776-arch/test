import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from './api';

export const useReports = (page = 1) =>
  useQuery({ queryKey: ['reports', page], queryFn: () => reportsApi.getAll(page) });

export const useResolveReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reportsApi.resolve,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reports'] }),
  });
};

export const useDismissReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reportsApi.dismiss,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reports'] }),
  });
};
