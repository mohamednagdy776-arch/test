import '../entities/event.dart';
import '../entities/event_attendee.dart';
import '../repositories/events_repository.dart';

class EventDetailUseCase {
  final EventsRepository _repository;
  const EventDetailUseCase(this._repository);

  Future<Event> call(String id) => _repository.getEvent(id);

  Future<List<EventAttendee>> attendees(String id, {String status = 'going'}) =>
      _repository.getAttendees(id, status: status);
}
