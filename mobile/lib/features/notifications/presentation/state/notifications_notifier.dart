import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/use_cases/notifications_use_case.dart';
import '../../../../core/utils/extensions.dart';
import 'notifications_state.dart';

class NotificationsNotifier extends StateNotifier<NotificationsState> {
  final NotificationsUseCase _useCase;
  static const _pageSize = 20;

  // No auto-load-on-construct -- same lesson as FeedNotifier/MatchesNotifier:
  // callers trigger load() explicitly from initState so tests can stub
  // before anything fires.
  NotificationsNotifier(this._useCase) : super(const NotificationsState());

  Future<void> load() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final type = serverTypeForTab(state.activeTab);
      final page = await _useCase.getNotifications(page: 1, limit: _pageSize, type: type);
      state = state.copyWith(items: page.items, isLoading: false, page: 1, hasMore: page.hasMore);
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل الإشعارات');
    }
  }

  // Switching All<->Unread doesn't need a refetch (both use the same
  // server-side type=null base list, filtered client-side); switching to/from
  // Likes/Comments does, since those are real server `type` filters -- same
  // distinction web's react-query key (serverType) draws.
  Future<void> setTab(NotificationTab tab) async {
    if (tab == state.activeTab) return;
    final previousType = serverTypeForTab(state.activeTab);
    final nextType = serverTypeForTab(tab);
    state = state.copyWith(activeTab: tab);
    if (nextType != previousType) {
      await load();
    }
  }

  Future<void> loadMore() async {
    if (!state.hasMore || state.isLoadingMore || state.isLoading) return;
    state = state.copyWith(isLoadingMore: true);
    try {
      final nextPage = state.page + 1;
      final type = serverTypeForTab(state.activeTab);
      final result = await _useCase.getNotifications(page: nextPage, limit: _pageSize, type: type);
      final merged = {for (final n in state.items) n.id: n};
      for (final n in result.items) {
        merged[n.id] = n;
      }
      state = state.copyWith(
        items: merged.values.toList(),
        page: nextPage,
        hasMore: result.hasMore,
        isLoadingMore: false,
      );
    } catch (_) {
      state = state.copyWith(isLoadingMore: false);
    }
  }

  Future<void> markAsRead(String id) async {
    final previous = state.items;
    final target = previous.firstWhereOrNull((n) => n.id == id);
    if (target == null || target.readStatus) return;

    state = state.copyWith(items: [for (final n in previous) n.id == id ? n.copyWith(readStatus: true) : n]);
    try {
      await _useCase.markAsRead(id);
    } catch (_) {
      state = state.copyWith(items: previous, error: 'تعذّر التحديث');
    }
  }

  Future<void> markAllRead() async {
    final previous = state.items;
    state = state.copyWith(items: [for (final n in previous) n.copyWith(readStatus: true)]);
    try {
      await _useCase.markAllRead();
    } catch (_) {
      state = state.copyWith(items: previous, error: 'تعذّر التحديث');
    }
  }

  Future<void> delete(String id) async {
    final previous = state.items;
    state = state.copyWith(items: previous.where((n) => n.id != id).toList());
    try {
      await _useCase.deleteNotification(id);
    } catch (_) {
      state = state.copyWith(items: previous, error: 'تعذّر حذف الإشعار');
    }
  }
}
