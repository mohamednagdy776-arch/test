import { apiClient } from '@/lib/api-client';

export interface Lab {
  id: string;
  name: string;
  commercialRegistration: string;
  status: 'pending' | 'active' | 'suspended';
  createdAt: string;
}

export interface ReferralCode {
  id: string;
  labId: string;
  code: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

export const labsApi = {
  getActiveLabs: () =>
    apiClient.get<Lab[]>('/lab-portal/labs').then((r) => r.data),

  getMyReferrals: () =>
    apiClient.get<ReferralCode[]>('/lab-portal/my-referrals').then((r) => r.data),

  generateCode: (labId: string) =>
    apiClient
      .get<ReferralCode>('/lab-portal/referral-code/generate', { params: { labId } })
      .then((r) => r.data),
};
