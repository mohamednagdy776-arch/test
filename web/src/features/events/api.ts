import { apiClient } from '@/lib/api-client';

export const eventsApi = {
  getEvents: (page = 1, limit = 20) =>
    apiClient.get('/events', { params: { page, limit } }).then((r) => r.data.data),

  getPublicEvents: (page = 1, limit = 20) =>
    apiClient.get('/events', { params: { page, limit } }).then((r) => r.data.data),

  getMyEvents: () =>
    apiClient.get('/events/my').then((r) => r.data.data),

  getInvitedEvents: () =>
    apiClient.get('/events/invited').then((r) => r.data.data),

  getEvent: (id: string) =>
    apiClient.get(`/events/${id}`).then((r) => r.data.data),

  searchEvents: (query: string) =>
    apiClient.get('/events/search', { params: { q: query } }).then((r) => r.data.data),

  getSuggestedEvents: (limit = 5) =>
    apiClient.get('/events/suggested', { params: { limit } }).then((r) => r.data.data),

  getUpcomingEvents: (limit = 5) =>
    apiClient.get('/events/upcoming', { params: { limit } }).then((r) => r.data.data),

  getPastEvents: (page = 1, limit = 20) =>
    apiClient.get('/events/past', { params: { page, limit } }).then((r) => r.data.data),

  createEvent: (title: string, description?: string, location?: string, startDate?: string, privacy?: string) => {
    const isoDate = startDate ? new Date(startDate).toISOString() : undefined;
    console.log('[createEvent] Sending:', { title, description, location, startDate: isoDate, privacy });
    return apiClient.post('/events', { title, description, location, startDate: isoDate, privacy }).then((r) => {
      console.log('[createEvent] Raw response:', r.data);
      const result = r.data.data;
      console.log('[createEvent] Extracted data:', result);
      return result;
    }).catch((err) => {
      console.error('[createEvent] Error:', err.response?.data || err.message);
      throw err;
    });
  },

  createEventWithCover: (title: string, description: string, location: string, startDate: string, privacy: string, coverPhoto: File) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('startDate', new Date(startDate).toISOString());
    formData.append('privacy', privacy);
    formData.append('coverPhoto', coverPhoto);
    console.log('[createEventWithCover] Sending:', { title, description, location, startDate: new Date(startDate).toISOString(), privacy });
    return apiClient.post('/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => {
      console.log('[createEventWithCover] Raw response:', r.data);
      return r.data.data;
    }).catch((err) => {
      console.error('[createEventWithCover] Error:', err.response?.data || err.message);
      throw err;
    });
  },

  rsvpEvent: (id: string, status: 'going' | 'interested' | 'not_going') =>
    apiClient.post(`/events/${id}/rsvp`, { status }).then((r) => r.data.data),
};
