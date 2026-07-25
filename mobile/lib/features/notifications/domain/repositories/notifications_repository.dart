import '../../../../core/api/api_response.dart';
import '../entities/notification.dart';
import '../entities/notification_preferences.dart';

abstract class NotificationsRepository {
  Future<PaginatedResult<AppNotification>> getNotifications({int page = 1, int limit = 20, String? type});
  Future<int> getUnreadCount();
  Future<void> markAsRead(String id);
  Future<void> markAllRead();
  Future<void> registerDeviceToken(String token, String platform);
  Future<NotificationPreferences> getPreferences();
  Future<NotificationPreferences> updatePreferences(Map<String, bool> changes);
}
