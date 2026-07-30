import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/use_cases/security_use_case.dart';
import 'security_state.dart';

class SecurityNotifier extends StateNotifier<SecurityState> {
  final SecurityUseCase _useCase;
  SecurityNotifier(this._useCase) : super(const SecurityState());

  Future<void> loadSessions() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final sessions = await _useCase.getSessions();
      state = state.copyWith(sessions: sessions, isLoading: false);
    } catch (_) {
      // Explicitly re-pass error here (not just isLoading: false) -- copyWith
      // resets `error` to null unless it's passed on every call, which would
      // otherwise silently swallow the message just set below.
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل الجلسات');
    }
  }

  Future<bool> revokeSession(String sessionId) async {
    try {
      await _useCase.revokeSession(sessionId);
      state = state.copyWith(
        sessions: state.sessions.where((s) => s.id != sessionId).toList(),
        error: state.error,
      );
      return true;
    } catch (_) {
      state = state.copyWith(error: 'فشل في إلغاء الجلسة');
      return false;
    }
  }

  Future<bool> revokeAllOtherSessions() async {
    try {
      await _useCase.revokeAllSessions();
      await loadSessions();
      return true;
    } catch (_) {
      state = state.copyWith(error: 'فشل في إلغاء الجلسات');
      return false;
    }
  }
}
