import 'package:image_picker/image_picker.dart';
import '../../../../core/api/api_response.dart';
import '../../domain/entities/event.dart';
import '../../domain/entities/event_attendee.dart';
import '../../domain/repositories/events_repository.dart';
import '../data_sources/events_remote_data_source.dart';

class EventsRepositoryImpl implements EventsRepository {
  final EventsRemoteDataSource _remoteDataSource;
  const EventsRepositoryImpl(this._remoteDataSource);

  @override
  Future<PaginatedResult<Event>> getEvents({int page = 1, int limit = 20}) async {
    final page0 = await _remoteDataSource.getEvents(page: page, limit: limit);
    return PaginatedResult(
      items: page0.items.map(Event.fromJson).toList(),
      total: page0.total,
      page: page0.page,
      limit: page0.limit,
      totalPages: page0.totalPages,
    );
  }

  @override
  Future<List<Event>> getMyEvents() async {
    final data = await _remoteDataSource.getMyEvents();
    return data.map((e) => Event.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<Event> getEvent(String id) async {
    final data = await _remoteDataSource.getEvent(id);
    return Event.fromJson(data);
  }

  @override
  Future<Event> createEvent({
    required String title,
    String? description,
    required String startDate,
    String? endDate,
    String? location,
    String privacy = 'public',
    XFile? coverPhoto,
  }) async {
    final data = await _remoteDataSource.createEvent(
      title: title,
      description: description,
      startDate: startDate,
      endDate: endDate,
      location: location,
      privacy: privacy,
      coverPhoto: coverPhoto,
    );
    return Event.fromJson(data);
  }

  @override
  Future<Event> updateEvent(
    String id, {
    String? title,
    String? description,
    String? location,
    String? startDate,
    String? endDate,
    String? privacy,
    XFile? coverPhoto,
  }) async {
    final data = await _remoteDataSource.updateEvent(
      id,
      title: title,
      description: description,
      location: location,
      startDate: startDate,
      endDate: endDate,
      privacy: privacy,
      coverPhoto: coverPhoto,
    );
    return Event.fromJson(data);
  }

  @override
  Future<Event> rsvp(String id, String status) async {
    final data = await _remoteDataSource.rsvp(id, status);
    return Event.fromJson(data);
  }

  @override
  Future<List<EventAttendee>> getAttendees(String id, {String status = 'going'}) async {
    final data = await _remoteDataSource.getAttendees(id, status: status);
    return data.map((e) => EventAttendee.fromJson(e as Map<String, dynamic>)).toList();
  }
}
