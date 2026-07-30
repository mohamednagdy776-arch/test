import '../../domain/entities/event.dart';
import '../../domain/entities/event_attendee.dart';

class EventDetailState {
  final Event? event;
  final List<EventAttendee> attendees;
  final String attendeesStatus; // 'going' | 'interested' | 'not_going'
  final bool isLoading;
  final bool isLoadingAttendees;
  final bool isRsvping;
  final bool isUpdatingCover;
  final String? error;

  const EventDetailState({
    this.event,
    this.attendees = const [],
    this.attendeesStatus = 'going',
    this.isLoading = false,
    this.isLoadingAttendees = false,
    this.isRsvping = false,
    this.isUpdatingCover = false,
    this.error,
  });

  EventDetailState copyWith({
    Event? event,
    List<EventAttendee>? attendees,
    String? attendeesStatus,
    bool? isLoading,
    bool? isLoadingAttendees,
    bool? isRsvping,
    bool? isUpdatingCover,
    String? error,
  }) {
    return EventDetailState(
      event: event ?? this.event,
      attendees: attendees ?? this.attendees,
      attendeesStatus: attendeesStatus ?? this.attendeesStatus,
      isLoading: isLoading ?? this.isLoading,
      isLoadingAttendees: isLoadingAttendees ?? this.isLoadingAttendees,
      isRsvping: isRsvping ?? this.isRsvping,
      isUpdatingCover: isUpdatingCover ?? this.isUpdatingCover,
      error: error,
    );
  }
}
