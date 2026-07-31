import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/affiliate_referral.dart';
import '../../domain/use_cases/affiliates_use_case.dart';
import 'affiliates_state.dart';

class AffiliatesNotifier extends StateNotifier<AffiliatesState> {
  final AffiliatesUseCase _useCase;
  AffiliatesNotifier(this._useCase) : super(const AffiliatesState());

  Future<void> loadInitial() async {
    state = state.copyWith(affiliate: state.affiliate, isLoading: true, error: null);
    try {
      final affiliate = await _useCase.getMyAffiliate();
      // Referral history only matters once the user has joined -- getting it
      // unconditionally reflects the backend's own actual behavior (returns
      // an empty list either way, confirmed live), but skipping the call
      // when there's no affiliate account yet avoids a pointless request on
      // first load, before "انضم الآن" has ever been pressed.
      final referrals = affiliate == null
          ? const <AffiliateReferral>[]
          : await _useCase.getReferrals();
      state = state.copyWith(
        affiliate: affiliate,
        referrals: referrals,
        isLoading: false,
        error: null,
      );
    } catch (_) {
      // Explicitly re-pass affiliate (not just isLoading: false) -- copyWith
      // resets `affiliate` to null unless it's passed on every call, which
      // would otherwise silently drop an already-loaded affiliate account.
      state = state.copyWith(affiliate: state.affiliate, isLoading: false, error: 'تعذّر تحميل بيانات برنامج الإحالة');
    }
  }

  Future<bool> join({String? referralCode}) async {
    state = state.copyWith(affiliate: state.affiliate, isJoining: true, error: null);
    try {
      final affiliate = await _useCase.joinAsAffiliate(referralCode: referralCode);
      state = state.copyWith(affiliate: affiliate, isJoining: false, error: null);
      return true;
    } catch (_) {
      state = state.copyWith(affiliate: state.affiliate, isJoining: false, error: 'حدث خطأ، حاول مجدداً');
      return false;
    }
  }
}
