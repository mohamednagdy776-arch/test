// Mirrors backend/src/affiliates/entities/affiliate-referral.entity.ts. Note
// there is deliberately no referred-user name/photo here: the backend's
// getReferralsForUser() (affiliates.service.ts) queries AffiliateReferral
// with no `relations`, and referredUserId is a plain column (not a
// @ManyToOne) -- confirmed live, GET /affiliates/referrals never returns a
// nested user object. Web's ReferralHistory reads `r.referred?.fullName`,
// which is always undefined; that's a pre-existing web bug, not something to
// replicate here.
class AffiliateReferral {
  final String id;
  final String referralCodeUsed;
  final String status; // pending | approved | paid | reversed
  final String conversionEvent; // registration | subscription
  final double commissionAmount;
  final DateTime createdAt;

  const AffiliateReferral({
    required this.id,
    required this.referralCodeUsed,
    required this.status,
    required this.conversionEvent,
    required this.commissionAmount,
    required this.createdAt,
  });

  factory AffiliateReferral.fromJson(Map<String, dynamic> json) {
    return AffiliateReferral(
      id: json['id'] as String,
      referralCodeUsed: json['referralCodeUsed'] as String? ?? '',
      status: json['status'] as String? ?? 'pending',
      conversionEvent: json['conversionEvent'] as String? ?? 'registration',
      commissionAmount: double.tryParse('${json['commissionAmount'] ?? 0}') ?? 0,
      createdAt: DateTime.tryParse(json['createdAt'] as String? ?? '') ?? DateTime.now(),
    );
  }
}
