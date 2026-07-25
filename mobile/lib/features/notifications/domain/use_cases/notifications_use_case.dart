import '../../../../core/api/api_response.dart';
import '../entities/notification.dart';
import '../entities/notification_preferences.dart';
import '../repositories/notifications_repository.dart';

// Bundles every read/mutate action the notifications screen needs (list,
// unread count, mark-read, mark-all-read, preferences) into one class --
// same consolidation as ChatThreadUseCase/RespondToMatchUseCase.
class NotificationsUseCase {
  final NotificationsRepository _repository;
  const NotificationsUseCase(this._repository);

  Future<PaginatedResult<AppNotification>> getNotifications({int page = 1, int limit = 20, String? type}) {
    return _repository.getNotifications(page: page, limit: limit, type: type);
  }

  Future<int> getUnreadCount() => _repository.getUnreadCount();

  Future<void> markAsRead(String id) => _repository.markAsRead(id);

  Future<void> markAllRead() => _repository.markAllRead();

  Future<NotificationPreferences> getPreferences() => _repository.getPreferences();

  Future<NotificationPreferences> updatePreferences(Map<String, bool> changes) {
    return _repository.updatePreferences(changes);
  }
}
