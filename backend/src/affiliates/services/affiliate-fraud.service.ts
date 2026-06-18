import { Injectable } from '@nestjs/common';
import { AffiliateReferral } from '../entities/affiliate-referral.entity';

@Injectable()
export class AffiliateFraudService {
  detectSelfReferral(affiliateUserId: string, referredUserId: string): boolean {
    return affiliateUserId === referredUserId;
  }

  checkVelocity(recentReferrals: AffiliateReferral[]): boolean {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = recentReferrals.filter(
      (r) => r.createdAt > oneHourAgo,
    ).length;
    return recentCount > 10;
  }
}
