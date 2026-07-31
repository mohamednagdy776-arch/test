import '../../domain/entities/affiliate.dart';
import '../../domain/entities/affiliate_referral.dart';

class AffiliatesState {
  final Affiliate? affiliate;
  final List<AffiliateReferral> referrals;
  final bool isLoading;
  final bool isJoining;
  final String? error;

  const AffiliatesState({
    this.affiliate,
    this.referrals = const [],
    this.isLoading = false,
    this.isJoining = false,
    this.error,
  });

  // `affiliate` and `error` are always directly assigned (no `?? this.field`
  // fallback), same convention as PremiumState -- callers that mean to
  // preserve the current value must explicitly pass
  // `affiliate: state.affiliate` / `error: state.error`.
  AffiliatesState copyWith({
    Affiliate? affiliate,
    List<AffiliateReferral>? referrals,
    bool? isLoading,
    bool? isJoining,
    String? error,
  }) {
    return AffiliatesState(
      affiliate: affiliate,
      referrals: referrals ?? this.referrals,
      isLoading: isLoading ?? this.isLoading,
      isJoining: isJoining ?? this.isJoining,
      error: error,
    );
  }
}
