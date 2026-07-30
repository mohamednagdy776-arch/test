import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/use_cases/consent_use_case.dart';
import '../../../profile/domain/use_cases/get_my_profile_use_case.dart';
import 'consent_state.dart';

class ConsentNotifier extends StateNotifier<ConsentState> {
  final ConsentUseCase _useCase;
  // GET /consent/my returns a flat array with no split -- the caller's own id
  // is needed client-side to bucket each row into incoming/outgoing (see
  // SettingsRepositoryImpl.getMyConsents). Reusing GetMyProfileUseCase avoids
  // duplicating a "who am I" call that already exists on the profile feature.
  final GetMyProfileUseCase _getMyProfile;

  ConsentNotifier(this._useCase, this._getMyProfile) : super(const ConsentState());

  Future<void> loadAll() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final profile = await _getMyProfile();
      final currentUserId = profile.userId ?? '';
      final result = await _useCase.getMyConsents(currentUserId);
      state = state.copyWith(incoming: result.incoming, outgoing: result.outgoing, isLoading: false);
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل طلبات الموافقة');
    }
  }

  void setTab(ConsentTab tab) {
    state = state.copyWith(tab: tab, error: state.error);
  }

  Future<bool> respond(String id, bool accept) async {
    try {
      await _useCase.respondToConsent(id, accept);
      await loadAll();
      return true;
    } catch (_) {
      state = state.copyWith(error: 'تعذّر تنفيذ الإجراء');
      return false;
    }
  }

  Future<bool> revoke(String id) async {
    try {
      await _useCase.revokeConsent(id);
      await loadAll();
      return true;
    } catch (_) {
      state = state.copyWith(error: 'تعذّر سحب الموافقة');
      return false;
    }
  }
}
