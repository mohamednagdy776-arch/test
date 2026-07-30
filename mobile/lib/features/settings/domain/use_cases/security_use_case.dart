import '../entities/session.dart';
import '../repositories/settings_repository.dart';

// Covers web's settings/security page: sessions, 2FA, change password, and
// delete account (all auth.controller.ts). Deactivate/reactivate account and
// the raw GET /auth/export are deliberately NOT included here -- grepping the
// web app shows those authApi methods are never called from any page (dead
// endpoints), so there's nothing on web to have parity with.
class SecurityUseCase {
  final SettingsRepository _repository;
  const SecurityUseCase(this._repository);

  Future<List<UserSession>> getSessions() => _repository.getSessions();

  Future<void> revokeSession(String sessionId) => _repository.revokeSession(sessionId);

  Future<void> revokeAllSessions() => _repository.revokeAllSessions();

  Future<Map<String, dynamic>> setup2FA() => _repository.setup2FA();

  Future<void> verify2FA(String code) => _repository.verify2FA(code);

  Future<void> disable2FA(String code) => _repository.disable2FA(code);

  Future<void> changePassword(String oldPassword, String newPassword) =>
      _repository.changePassword(oldPassword, newPassword);

  Future<void> deleteAccount(String password) => _repository.deleteAccount(password);
}
