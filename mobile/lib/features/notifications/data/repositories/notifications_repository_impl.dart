import '../../../../core/api/api_response.dart';
import '../../domain/entities/notification.dart';
import '../../domain/entities/notification_preferences.dart';
import '../../domain/repositories/notifications_repository.dart';
import '../data_sources/notifications_remote_data_source.dart';

class NotificationsRepositoryImpl implements NotificationsRepository {
  final NotificationsRemoteDataSource _remoteDataSource;
  const NotificationsRepositoryImpl(this._remoteDataSource);

  @override
  Future<PaginatedResult<AppNotification>> getNotifications({int page = 1, int limit = 20, String? type}) async {
    final page0 = await _remoteDataSource.getNotifications(page: page, limit: limit, type: type);
    return PaginatedResult(
      items: page0.items.map(AppNotification.fromJson).toList(),
      total: page0.total,
      page: page0.page,
      limit: page0.limit,
      totalPages: page0.totalPages,
    );
  }

  @override
  Future<int> getUnreadCount() => _remoteDataSource.getUnreadCount();

  @override
  Future<void> markAsRead(String id) => _remoteDataSource.markAsRead(id);

  @override
  Future<void> markAllRead() => _remoteDataSource.markAllRead();

  @override
  Future<void> deleteNotification(String id) => _remoteDataSource.deleteNotification(id);

  @override
  Future<void> registerDeviceToken(String token, String platform) {
    return _remoteDataSource.registerDeviceToken(token, platform);
  }

  @override
  Future<NotificationPreferences> getPreferences() async {
    final data = await _remoteDataSource.getPreferences();
    return NotificationPreferences.fromJson(data);
  }

  @override
  Future<NotificationPreferences> updatePreferences(Map<String, bool> changes) async {
    final data = await _remoteDataSource.updatePreferences(changes);
    return NotificationPreferences.fromJson(data);
  }
}
