import { apiClient } from '@/lib/api-client';

export const eventsApi = {
  getEvents: (page = 1, limit = 20) =>
    apiClient.get('/events', { params: { page, limit } }).then((r) => r.data),

  getPublicEvents: (page = 1, limit = 20) =>
    apiClient.get('/events', { params: { page, limit } }).then((r) => r.data),

  getMyEvents: () =>
    apiClient.get('/events/my').then((r) => r.data),

  getInvitedEvents: () =>
    apiClient.get('/events/invited').then((r) => r.data),

  getEvent: (id: string) =>
    apiClient.get(`/events/${id}`).then((r) => r.data),

  searchEvents: (query: string) =>
    apiClient.get('/events/search', { params: { q: query } }).then((r) => r.data),

  getSuggestedEvents: (limit = 5) =>
    apiClient.get('/events/suggested', { params: { limit } }).then((r) => r.data),

  getUpcomingEvents: (limit = 5) =>
    apiClient.get('/events/upcoming', { params: { limit } }).then((r) => r.data),

  getPastEvents: (page = 1, limit = 20) =>
    apiClient.get('/events/past', { params: { page, limit } }).then((r) => r.data),

  createEvent: (title: string, description?: string, location?: string, startDate?: string, privacy?: string) =>
    apiClient.post('/events', { title, description, location, startDate, privacy }).then((r) => r.data),

  createEventWithCover: (title: string, description: string, location: string, startDate: string, privacy: string, coverPhoto: File) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('startDate', startDate);
    formData.append('privacy', privacy);
    formData.append('coverPhoto', coverPhoto);
    return apiClient.post('/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  rsvpEvent: (id: string, status: 'going' | 'interested' | 'not_going') =>
    apiClient.post(`/events/${id}/rsvp`, { status }).then((r) => r.data),
};
