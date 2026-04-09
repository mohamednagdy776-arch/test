'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description?: string; location?: string; startDate: string }) =>
      apiClient.post('/events', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });
};

export const useRsvpEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, status }: { eventId: string; status: 'going' | 'interested' | 'not_going' }) =>
      apiClient.post(`/events/${eventId}/rsvp`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });
};