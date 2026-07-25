import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/use_cases/notifications_use_case.dart';
import '../../../../core/utils/extensions.dart';
import 'notifications_state.dart';

class NotificationsNotifier extends StateNotifier<NotificationsState> {
  final NotificationsUseCase _useCase;

  // No auto-load-on-construct -- same lesson as FeedNotifier/MatchesNotifier:
  // callers trigger load() explicitly from initState so tests can stub
  // before anything fires.
  NotificationsNotifier(this._useCase) : super(const NotificationsState());

  Future<void> load() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final page = await _useCase.getNotifications();
      state = state.copyWith(items: page.items, isLoading: false);
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل الإشعارات');
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
}
