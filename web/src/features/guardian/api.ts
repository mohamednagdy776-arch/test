import { apiClient } from '@/lib/api-client';

// [Body_Sadek] #753 — wali (guardian)-supervised conversations.
export const guardianApi = {
  myGuardian: () => apiClient.get('/chat/guardian').then((r) => r.data),
  setGuardian: (guardianId: string) => apiClient.post('/chat/guardian', { guardianId }).then((r) => r.data),
  removeGuardian: () => apiClient.delete('/chat/guardian').then((r) => r.data),
  myWards: () => apiClient.get('/chat/guardian/wards').then((r) => r.data),
  // Whether a given user is under guardian oversight (per-conversation indicator).
  status: (userId: string) => apiClient.get(`/chat/guardian/status/${userId}`).then((r) => r.data),
  wardConversations: (wardId: string) => apiClient.get(`/chat/guardian/wards/${wardId}/conversations`).then((r) => r.data),
};
