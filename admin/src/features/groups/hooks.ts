import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from './api';

export const useGroups = (page = 1) =>
  useQuery({ queryKey: ['groups', page], queryFn: () => groupsApi.getAll(page) });

export const useDeleteGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: groupsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] }),
  });
};
