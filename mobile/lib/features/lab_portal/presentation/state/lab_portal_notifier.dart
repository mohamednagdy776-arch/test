import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/lab_referral_code.dart';
import '../../domain/use_cases/lab_portal_use_case.dart';
import 'lab_portal_state.dart';

class LabPortalNotifier extends StateNotifier<LabPortalState> {
  final LabPortalUseCase _useCase;
  LabPortalNotifier(this._useCase) : super(const LabPortalState());

  Future<void> loadInitial() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final labs = await _useCase.getActiveLabs();
      final referrals = await _useCase.getMyReferrals();
      state = state.copyWith(labs: labs, referrals: referrals, isLoading: false, error: null);
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل بيانات المختبرات');
    }
  }

  Future<LabReferralCode?> generateCode(String labId) async {
    state = state.copyWith(generatingLabId: labId, error: null);
    try {
      final code = await _useCase.generateReferralCode(labId);
      // Refresh the referral list so the new code shows up in history too.
      final referrals = await _useCase.getMyReferrals();
      state = state.copyWith(referrals: referrals, generatingLabId: null, error: null);
      return code;
    } catch (_) {
      state = state.copyWith(generatingLabId: null, error: 'فشل إنشاء كود الإحالة');
      return null;
    }
  }
}
