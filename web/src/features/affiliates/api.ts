import { apiClient } from '@/lib/api-client';

export const affiliatesApi = {
  getMyAffiliate: () =>
    apiClient.get('/affiliates/me').then(r => r.data),

  create: (referralCode?: string) =>
    apiClient.post('/affiliates', referralCode ? { referralCode } : {}).then(r => r.data),
};
