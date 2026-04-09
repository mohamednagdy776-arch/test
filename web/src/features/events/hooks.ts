'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from './api';

export function useEvents(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['events', page],
    queryFn: () => eventsApi.getEvents(page, limit),
  });
}

export function usePublicEvents(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['public-events', page],
    queryFn: () => eventsApi.getPublicEvents(page, limit),
  });
}

export function useMyEvents() {
  return useQuery({
    queryKey: ['my-events'],
    queryFn: () => eventsApi.getMyEvents(),
  });
}

export function useInvitedEvents() {
  return useQuery({
    queryKey: ['invited-events'],
    queryFn: () => eventsApi.getInvitedEvents(),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getEvent(id),
  });
}

export function useSearchEvents(query: string) {
  return useQuery({
    queryKey: ['events-search', query],
    queryFn: () => eventsApi.searchEvents(query),
    enabled: query.trim().length >= 2,
  });
}

export function useSuggestedEvents(limit = 5) {
  return useQuery({
    queryKey: ['suggested-events', limit],
    queryFn: () => eventsApi.getSuggestedEvents(limit),
  });
}

export function useUpcomingEvents(limit = 5) {
  return useQuery({
    queryKey: ['upcoming-events', limit],
    queryFn: () => eventsApi.getUpcomingEvents(limit),
  });
}

export function usePastEvents(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['past-events', page],
    queryFn: () => eventsApi.getPastEvents(page, limit),
  });
}

export function useRsvpEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, status }: { eventId: string; status: 'going' | 'interested' | 'not_going' }) =>
      eventsApi.rsvpEvent(eventId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-events'] });
      qc.invalidateQueries({ queryKey: ['invited-events'] });
      qc.invalidateQueries({ queryKey: ['events'] });
      qc.invalidateQueries({ queryKey: ['event'] });
      qc.invalidateQueries({ queryKey: ['upcoming-events'] });
    },
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ title, description, location, startDate, privacy, coverPhoto }: { title: string; description?: string; location?: string; startDate?: string; privacy?: string; coverPhoto?: File }) =>
      coverPhoto ? eventsApi.createEventWithCover(title, description || '', location || '', startDate || '', privacy || 'public', coverPhoto) : eventsApi.createEvent(title, description, location, startDate, privacy),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-events'] });
      qc.invalidateQueries({ queryKey: ['events'] });
      qc.invalidateQueries({ queryKey: ['upcoming-events'] });
    },
  });
}
