import '../../domain/entities/event.dart';

class EventsListState {
  final List<Event> events;
  final List<Event> myEvents;
  final int page;
  final bool hasMore;
  final bool isLoading;
  final bool isLoadingMore;
  final bool isCreating;
  final String? error;
  final Set<String> rsvpPendingIds;

  const EventsListState({
    this.events = const [],
    this.myEvents = const [],
    this.page = 1,
    this.hasMore = false,
    this.isLoading = false,
    this.isLoadingMore = false,
    this.isCreating = false,
    this.error,
    this.rsvpPendingIds = const {},
  });

  EventsListState copyWith({
    List<Event>? events,
    List<Event>? myEvents,
    int? page,
    bool? hasMore,
    bool? isLoading,
    bool? isLoadingMore,
    bool? isCreating,
    String? error,
    Set<String>? rsvpPendingIds,
  }) {
    return EventsListState(
      events: events ?? this.events,
      myEvents: myEvents ?? this.myEvents,
      page: page ?? this.page,
      hasMore: hasMore ?? this.hasMore,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      isCreating: isCreating ?? this.isCreating,
      error: error,
      rsvpPendingIds: rsvpPendingIds ?? this.rsvpPendingIds,
    );
  }
}
