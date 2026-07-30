import '../entities/notification_settings.dart';
import '../repositories/settings_repository.dart';

// Covers web's settings/notifications page: the in-app notification-category
// toggles + the email newsletter toggles (settings.controller.ts). Distinct
// from features/notifications' NotificationsUseCase, which covers the PUSH
// category preferences (notifications.controller.ts's /preferences) --
// that use case is reused as-is (embedded) from the new Notifications
// settings screen rather than re-implemented here.
class NotificationsSettingsUseCase {
  final SettingsRepository _repository;
  const NotificationsSettingsUseCase(this._repository);

  Future<NotificationSettings> getNotificationSettings() => _repository.getNotificationSettings();

  Future<NotificationSettings> updateNotificationSettings(Map<String, dynamic> changes) =>
      _repository.updateNotificationSettings(changes);

  Future<NewsletterSettings> getNewsletterSettings() => _repository.getNewsletterSettings();

  Future<NewsletterSettings> updateNewsletterSettings(Map<String, dynamic> changes) =>
      _repository.updateNewsletterSettings(changes);
}
