import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/use_cases/security_use_case.dart';
import 'security_state.dart';

class SecurityNotifier extends StateNotifier<SecurityState> {
  final SecurityUseCase _useCase;
  SecurityNotifier(this._useCase) : super(const SecurityState());

  Future<void> loadAll() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final sessions = await _useCase.getSessions();
      final twoFactorEnabled = await _useCase.getTwoFactorEnabled();
      state = state.copyWith(sessions: sessions, twoFactorEnabled: twoFactorEnabled, isLoading: false);
    } catch (_) {
      // Explicitly re-pass error here (not just isLoading: false) -- copyWith
      // resets `error` to null unless it's passed on every call, which would
      // otherwise silently swallow the message just set below.
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل بيانات الأمان');
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
      await loadAll();
      return true;
    } catch (_) {
      state = state.copyWith(error: 'فشل في إلغاء الجلسات');
      return false;
    }
  }

  Future<Map<String, dynamic>?> setup2FA() async {
    try {
      return await _useCase.setup2FA();
    } catch (_) {
      state = state.copyWith(error: 'فشل في إعداد التحقق');
      return null;
    }
  }

  Future<bool> verify2FA(String code) async {
    try {
      await _useCase.verify2FA(code);
      state = state.copyWith(twoFactorEnabled: true, error: state.error);
      return true;
    } catch (_) {
      state = state.copyWith(error: 'رمز التحقق غير صحيح');
      return false;
    }
  }

  Future<bool> disable2FA(String code) async {
    try {
      await _useCase.disable2FA(code);
      state = state.copyWith(twoFactorEnabled: false, error: state.error);
      return true;
    } catch (_) {
      state = state.copyWith(error: 'رمز التحقق غير صحيح');
      return false;
    }
  }

  Future<String?> changePassword(String oldPassword, String newPassword) async {
    try {
      await _useCase.changePassword(oldPassword, newPassword);
      return null;
    } catch (e) {
      return 'فشل تغيير كلمة المرور';
    }
  }

  Future<String?> deleteAccount(String password) async {
    try {
      await _useCase.deleteAccount(password);
      return null;
    } catch (e) {
      return 'فشل حذف الحساب، حاول مرة أخرى';
    }
  }
}
