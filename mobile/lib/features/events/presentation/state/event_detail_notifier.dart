import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../domain/use_cases/event_detail_use_case.dart';
import '../../domain/use_cases/manage_event_use_case.dart';
import 'event_detail_state.dart';

class EventDetailNotifier extends StateNotifier<EventDetailState> {
  final String eventId;
  final EventDetailUseCase _detail;
  final ManageEventUseCase _manage;

  // No auto-load-on-construct -- callers trigger load() from initState.
  EventDetailNotifier(this.eventId, this._detail, this._manage) : super(const EventDetailState());

  Future<void> load() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final event = await _detail(eventId);
      state = state.copyWith(event: event, isLoading: false);
      await loadAttendees(state.attendeesStatus);
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل الحدث');
    }
  }

  Future<void> refresh() => load();

  Future<void> loadAttendees(String status) async {
    state = state.copyWith(isLoadingAttendees: true, attendeesStatus: status);
    try {
      final attendees = await _detail.attendees(eventId, status: status);
      state = state.copyWith(attendees: attendees, isLoadingAttendees: false);
    } catch (_) {
      state = state.copyWith(isLoadingAttendees: false);
    }
  }

  // RSVP's own response only echoes the base event fields (no refreshed
  // counts/userRsvp -- curl-confirmed), so a full reload is needed to pick up
  // the new goingCount/interestedCount and the attendee list for whichever
  // tab is active.
  Future<void> rsvp(String status) async {
    state = state.copyWith(isRsvping: true, error: null);
    try {
      await _manage.rsvp(eventId, status);
      await load();
    } catch (_) {
      state = state.copyWith(isRsvping: false, error: 'تعذّر تحديث حالة الحضور');
      return;
    }
    state = state.copyWith(isRsvping: false);
  }

  // No button/input existed anywhere to change an event's cover photo after
  // creation (#374 on web) -- mirrored here as the owner-only cover-change
  // action on the detail screen, same placement as web's detail page.
  Future<void> updateCoverPhoto(XFile file) async {
    state = state.copyWith(isUpdatingCover: true, error: null);
    try {
      await _manage.update(eventId, coverPhoto: file);
      await load();
    } catch (_) {
      state = state.copyWith(isUpdatingCover: false, error: 'تعذّر تحديث صورة الغلاف');
      return;
    }
    state = state.copyWith(isUpdatingCover: false);
  }
}
