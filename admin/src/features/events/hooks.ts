import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from './api';

export const useEvents = (page = 1) =>
  useQuery({ queryKey: ['events', page], queryFn: () => eventsApi.getAll(page) });

export const useDeleteEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: eventsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
};
