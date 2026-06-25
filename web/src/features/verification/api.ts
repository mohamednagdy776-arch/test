import { apiClient } from '@/lib/api-client';

// [Body_Sadek] #755 — identity (KYC) verification.
export const verificationApi = {
  status: () =>
    apiClient.get('/verification/identity/status').then((r) => r.data),

  submit: (selfie: File, idDocument: File) => {
    const form = new FormData();
    form.append('selfie', selfie);
    form.append('idDocument', idDocument);
    return apiClient.post('/verification/identity', form).then((r) => r.data);
  },
};
