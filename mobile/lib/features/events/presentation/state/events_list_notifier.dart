import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../domain/use_cases/get_events_use_case.dart';
import '../../domain/use_cases/manage_event_use_case.dart';
import 'events_list_state.dart';

class EventsListNotifier extends StateNotifier<EventsListState> {
  final GetEventsUseCase _getEvents;
  final ManageEventUseCase _manage;

  // No auto-load-on-construct -- same lesson as every other notifier here.
  EventsListNotifier(this._getEvents, this._manage) : super(const EventsListState());

  Future<void> loadInitial() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final page0 = await _getEvents.events(page: 1, limit: 20);
      final my = await _getEvents.myEvents();
      state = state.copyWith(
        events: page0.items,
        myEvents: my,
        page: 1,
        hasMore: page0.hasMore,
        isLoading: false,
      );
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل الأحداث');
    }
  }

  Future<void> refresh() => loadInitial();

  Future<void> loadMore() async {
    if (!state.hasMore || state.isLoadingMore) return;
    state = state.copyWith(isLoadingMore: true);
    try {
      final nextPage = state.page + 1;
      final page0 = await _getEvents.events(page: nextPage, limit: 20);
      final merged = {for (final e in state.events) e.id: e};
      for (final e in page0.items) {
        merged[e.id] = e;
      }
      state = state.copyWith(
        events: merged.values.toList(),
        page: nextPage,
        hasMore: page0.hasMore,
        isLoadingMore: false,
      );
    } catch (_) {
      state = state.copyWith(isLoadingMore: false);
    }
  }

  Future<void> rsvp(String eventId, String status) async {
    state = state.copyWith(rsvpPendingIds: {...state.rsvpPendingIds, eventId});
    try {
      await _manage.rsvp(eventId, status);
      await loadInitial();
    } catch (_) {
      state = state.copyWith(error: 'تعذّر تحديث حالة الحضور');
    } finally {
      state = state.copyWith(rsvpPendingIds: state.rsvpPendingIds.where((e) => e != eventId).toSet());
    }
  }

  Future<bool> create({
    required String title,
    String? description,
    required String startDate,
    String? endDate,
    String? location,
    String privacy = 'public',
    XFile? coverPhoto,
  }) async {
    state = state.copyWith(isCreating: true, error: null);
    try {
      await _manage.create(
        title: title,
        description: description,
        startDate: startDate,
        endDate: endDate,
        location: location,
        privacy: privacy,
        coverPhoto: coverPhoto,
      );
      await loadInitial();
      state = state.copyWith(isCreating: false);
      return true;
    } catch (_) {
      state = state.copyWith(isCreating: false, error: 'تعذّر إنشاء الحدث');
      return false;
    }
  }
}
