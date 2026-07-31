import '../entities/affiliate.dart';
import '../entities/affiliate_referral.dart';

abstract class AffiliatesRepository {
  // Null when the current user has no affiliate account yet -- confirmed
  // live, GET /affiliates/me returns `data: null` in that case.
  Future<Affiliate?> getMyAffiliate();

  Future<List<AffiliateReferral>> getReferrals();

  Future<Affiliate> joinAsAffiliate({String? referralCode});

  // Null when the code doesn't match any affiliate -- confirmed live,
  // GET /affiliates/code/:code returns `data: null` rather than 404.
  Future<Affiliate?> validateReferralCode(String code);
}
