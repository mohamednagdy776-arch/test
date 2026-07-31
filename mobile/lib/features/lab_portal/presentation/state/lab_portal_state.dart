import '../../domain/entities/lab.dart';
import '../../domain/entities/lab_referral_code.dart';

class LabPortalState {
  final List<Lab> labs;
  final List<LabReferralCode> referrals;
  final bool isLoading;
  final String? generatingLabId; // non-null while a generate call is in flight for that lab
  final String? error;

  const LabPortalState({
    this.labs = const [],
    this.referrals = const [],
    this.isLoading = false,
    this.generatingLabId,
    this.error,
  });

  // `generatingLabId` and `error` are always directly assigned (same
  // convention as AffiliatesState/PremiumState) -- callers that mean to
  // preserve the current value must explicitly pass it back in.
  LabPortalState copyWith({
    List<Lab>? labs,
    List<LabReferralCode>? referrals,
    bool? isLoading,
    String? generatingLabId,
    String? error,
  }) {
    return LabPortalState(
      labs: labs ?? this.labs,
      referrals: referrals ?? this.referrals,
      isLoading: isLoading ?? this.isLoading,
      generatingLabId: generatingLabId,
      error: error,
    );
  }
}
