import 'package:image_picker/image_picker.dart';
import '../../domain/entities/privacy_settings.dart';
import '../../domain/entities/appearance_settings.dart';
import '../../domain/entities/notification_settings.dart';
import '../../domain/entities/blocked_user.dart';
import '../../domain/entities/session.dart';
import '../../domain/entities/consent_request.dart';
import '../../domain/entities/verification_status.dart';
import '../../domain/repositories/settings_repository.dart';
import '../data_sources/settings_remote_data_source.dart';

class SettingsRepositoryImpl implements SettingsRepository {
  final SettingsRemoteDataSource _remote;
  const SettingsRepositoryImpl(this._remote);

  @override
  Future<PrivacySettings> getPrivacySettings() async {
    return PrivacySettings.fromJson(await _remote.getPrivacySettings());
  }

  @override
  Future<PrivacySettings> updatePrivacySettings(Map<String, dynamic> changes) async {
    return PrivacySettings.fromJson(await _remote.updatePrivacySettings(changes));
  }

  @override
  Future<List<BlockedUser>> getBlocks() async {
    final items = await _remote.getBlocks();
    return items.map((e) => BlockedUser.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<void> unblockUser(String blockedUserId) => _remote.unblockUser(blockedUserId);

  @override
  Future<List<PhotoAccessRequest>> getPhotoAccessRequests() async {
    final items = await _remote.getPhotoAccessRequests();
    return items.map((e) => PhotoAccessRequest.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<void> respondToPhotoAccessRequest(String requestId, bool approve) =>
      _remote.respondToPhotoAccessRequest(requestId, approve);

  @override
  Future<Map<String, dynamic>> exportMyData() => _remote.exportMyData();

  @override
  Future<AppearanceSettings> getAppearanceSettings() async {
    return AppearanceSettings.fromJson(await _remote.getAppearanceSettings());
  }

  @override
  Future<AppearanceSettings> updateAppearanceSettings(Map<String, dynamic> changes) async {
    return AppearanceSettings.fromJson(await _remote.updateAppearanceSettings(changes));
  }

  @override
  Future<NotificationSettings> getNotificationSettings() async {
    return NotificationSettings.fromJson(await _remote.getNotificationSettings());
  }

  @override
  Future<NotificationSettings> updateNotificationSettings(Map<String, dynamic> changes) async {
    return NotificationSettings.fromJson(await _remote.updateNotificationSettings(changes));
  }

  @override
  Future<NewsletterSettings> getNewsletterSettings() async {
    return NewsletterSettings.fromJson(await _remote.getNewsletterSettings());
  }

  @override
  Future<NewsletterSettings> updateNewsletterSettings(Map<String, dynamic> changes) async {
    return NewsletterSettings.fromJson(await _remote.updateNewsletterSettings(changes));
  }

  @override
  Future<bool> getTwoFactorEnabled() => _remote.getTwoFactorEnabled();

  @override
  Future<List<UserSession>> getSessions() async {
    final items = await _remote.getSessions();
    return items.map((e) => UserSession.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<void> revokeSession(String sessionId) => _remote.revokeSession(sessionId);

  @override
  Future<void> revokeAllSessions() => _remote.revokeAllSessions();

  @override
  Future<Map<String, dynamic>> setup2FA() => _remote.setup2FA();

  @override
  Future<void> verify2FA(String code) => _remote.verify2FA(code);

  @override
  Future<void> disable2FA(String code) => _remote.disable2FA(code);

  @override
  Future<void> changePassword(String oldPassword, String newPassword) =>
      _remote.changePassword(oldPassword, newPassword);

  @override
  Future<void> deleteAccount(String password) => _remote.deleteAccount(password);

  @override
  Future<String> getCurrentEmail() => _remote.getCurrentEmail();

  @override
  Future<void> requestEmailChange(String newEmail, String currentPassword) =>
      _remote.requestEmailChange(newEmail, currentPassword);

  @override
  Future<({List<ConsentRequestItem> incoming, List<ConsentRequestItem> outgoing})> getMyConsents(
    String currentUserId,
  ) async {
    final rows = await _remote.getMyConsents();
    final all = rows.map((e) => ConsentRequestItem.fromJson(e as Map<String, dynamic>)).toList();
    return (
      incoming: all.where((r) => r.targetUserId == currentUserId).toList(),
      outgoing: all.where((r) => r.requesterUserId == currentUserId).toList(),
    );
  }

  @override
  Future<void> respondToConsent(String id, bool accept) => _remote.respondToConsent(id, accept);

  @override
  Future<void> revokeConsent(String id) => _remote.revokeConsent(id);

  @override
  Future<IdentityVerificationStatus> getVerificationStatus() async {
    return IdentityVerificationStatus.fromJson(await _remote.getVerificationStatus());
  }

  @override
  Future<void> submitVerification({required String selfiePath, required String idDocumentPath}) {
    return _remote.submitVerification(XFile(selfiePath), XFile(idDocumentPath));
  }

  @override
  Future<void> submitReport({
    required String type,
    required String description,
    String? email,
    List<String>? attachmentPaths,
  }) {
    return _remote.submitReport(
      type: type,
      description: description,
      email: email,
      attachments: attachmentPaths?.map((p) => XFile(p)).toList(),
    );
  }
}
