import '../../../../core/api/api_response.dart';
import '../entities/event.dart';
import '../repositories/events_repository.dart';

class GetEventsUseCase {
  final EventsRepository _repository;
  const GetEventsUseCase(this._repository);

  Future<PaginatedResult<Event>> events({int page = 1, int limit = 20}) =>
      _repository.getEvents(page: page, limit: limit);

  Future<List<Event>> myEvents() => _repository.getMyEvents();
}
