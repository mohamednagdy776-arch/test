import '../../domain/entities/notification.dart';

class NotificationsState {
  final List<AppNotification> items;
  final bool isLoading;
  final String? error;

  const NotificationsState({this.items = const [], this.isLoading = false, this.error});

  NotificationsState copyWith({List<AppNotification>? items, bool? isLoading, String? error}) {
    return NotificationsState(
      items: items ?? this.items,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}
