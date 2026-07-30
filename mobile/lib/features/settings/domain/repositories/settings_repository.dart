import '../entities/privacy_settings.dart';
import '../entities/appearance_settings.dart';
import '../entities/notification_settings.dart';
import '../entities/blocked_user.dart';
import '../entities/session.dart';
import '../entities/consent_request.dart';
import '../entities/verification_status.dart';

// One repository for the whole Settings feature -- privacy/appearance/
// notifications/newsletter/blocks all come from backend's single
// settings.controller.ts module; sessions/2FA/password/email live in
// auth.controller.ts; consent, verification and support-report are their own
// small backend modules. All are read-mostly, low-traffic settings screens,
// so they share one data source/repository rather than one per backend
// controller (see mobile-settings phase brief).
abstract class SettingsRepository {
  // ---- Privacy (settings.controller.ts) ----
  Future<PrivacySettings> getPrivacySettings();
  Future<PrivacySettings> updatePrivacySettings(Map<String, dynamic> changes);
  Future<List<BlockedUser>> getBlocks();
  Future<void> unblockUser(String blockedUserId);
  Future<List<PhotoAccessRequest>> getPhotoAccessRequests();
  Future<void> respondToPhotoAccessRequest(String requestId, bool approve);
  Future<Map<String, dynamic>> exportMyData();

  // ---- Appearance (settings.controller.ts) ----
  Future<AppearanceSettings> getAppearanceSettings();
  Future<AppearanceSettings> updateAppearanceSettings(Map<String, dynamic> changes);

  // ---- Notifications + newsletter (settings.controller.ts) ----
  Future<NotificationSettings> getNotificationSettings();
  Future<NotificationSettings> updateNotificationSettings(Map<String, dynamic> changes);
  Future<NewsletterSettings> getNewsletterSettings();
  Future<NewsletterSettings> updateNewsletterSettings(Map<String, dynamic> changes);

  // ---- Security / account (auth.controller.ts) ----
  Future<List<UserSession>> getSessions();
  Future<void> revokeSession(String sessionId);
  Future<void> revokeAllSessions();
  Future<Map<String, dynamic>> setup2FA();
  Future<void> verify2FA(String code);
  Future<void> disable2FA(String code);
  Future<void> changePassword(String oldPassword, String newPassword);
  Future<void> deleteAccount(String password);

  // ---- Email (auth.controller.ts) ----
  Future<void> requestEmailChange(String newEmail, String currentPassword);

  // ---- Consent (consent.controller.ts) ----
  Future<({List<ConsentRequestItem> incoming, List<ConsentRequestItem> outgoing})> getMyConsents();
  Future<void> respondToConsent(String id, bool accept);
  Future<void> revokeConsent(String id);

  // ---- Identity verification (verification.controller.ts) ----
  Future<IdentityVerificationStatus> getVerificationStatus();
  Future<void> submitVerification({required String selfiePath, required String idDocumentPath});

  // ---- Report a problem (support.controller.ts) ----
  Future<void> submitReport({required String type, required String description, String? email, List<String>? attachmentPaths});
}
