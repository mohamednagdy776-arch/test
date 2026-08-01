import '../../domain/entities/notification.dart';

// Mirrors web's All/Unread/Likes/Comments tabs (web/src/app/(main)/notifications/page.tsx).
// "Unread" is a client-side filter over the same base list (the backend has no
// `unread` notification type to filter by); "Likes"/"Comments" are real
// server-side `type` filters, so switching to/from those refetches page 1.
enum NotificationTab { all, unread, likes, comments }

String? serverTypeForTab(NotificationTab tab) {
  switch (tab) {
    case NotificationTab.likes:
      return 'like';
    case NotificationTab.comments:
      return 'comment';
    case NotificationTab.all:
    case NotificationTab.unread:
      return null;
  }
}

class NotificationsState {
  final List<AppNotification> items;
  final bool isLoading;
  final bool isLoadingMore;
  final String? error;
  final NotificationTab activeTab;
  final int page;
  final bool hasMore;

  const NotificationsState({
    this.items = const [],
    this.isLoading = false,
    this.isLoadingMore = false,
    this.error,
    this.activeTab = NotificationTab.all,
    this.page = 1,
    this.hasMore = false,
  });

  // The "Unread" tab filters the already-fetched list client-side, same as
  // web's `activeTab === 'unread' ? allNotifications.filter(...) : allNotifications`.
  List<AppNotification> get filteredItems =>
      activeTab == NotificationTab.unread ? items.where((n) => !n.readStatus).toList() : items;

  NotificationsState copyWith({
    List<AppNotification>? items,
    bool? isLoading,
    bool? isLoadingMore,
    String? error,
    NotificationTab? activeTab,
    int? page,
    bool? hasMore,
  }) {
    return NotificationsState(
      items: items ?? this.items,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      error: error,
      activeTab: activeTab ?? this.activeTab,
      page: page ?? this.page,
      hasMore: hasMore ?? this.hasMore,
    );
  }
}
