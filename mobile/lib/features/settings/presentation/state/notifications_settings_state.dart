import '../../domain/entities/notification_settings.dart';

class NotificationsSettingsState {
  final NotificationSettings notificationSettings;
  final NewsletterSettings newsletterSettings;
  final bool isLoading;
  final String? error;

  const NotificationsSettingsState({
    this.notificationSettings = const NotificationSettings(),
    this.newsletterSettings = const NewsletterSettings(),
    this.isLoading = false,
    this.error,
  });

  NotificationsSettingsState copyWith({
    NotificationSettings? notificationSettings,
    NewsletterSettings? newsletterSettings,
    bool? isLoading,
    String? error,
  }) {
    return NotificationsSettingsState(
      notificationSettings: notificationSettings ?? this.notificationSettings,
      newsletterSettings: newsletterSettings ?? this.newsletterSettings,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}
