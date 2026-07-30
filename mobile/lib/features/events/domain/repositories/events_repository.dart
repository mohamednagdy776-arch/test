import 'package:image_picker/image_picker.dart';
import '../../../../core/api/api_response.dart';
import '../entities/event.dart';
import '../entities/event_attendee.dart';

abstract class EventsRepository {
  Future<PaginatedResult<Event>> getEvents({int page = 1, int limit = 20});
  Future<List<Event>> getMyEvents();
  Future<Event> getEvent(String id);

  Future<Event> createEvent({
    required String title,
    String? description,
    required String startDate,
    String? endDate,
    String? location,
    String privacy = 'public',
    XFile? coverPhoto,
  });

  Future<Event> updateEvent(
    String id, {
    String? title,
    String? description,
    String? location,
    String? startDate,
    String? endDate,
    String? privacy,
    XFile? coverPhoto,
  });

  Future<Event> rsvp(String id, String status);
  Future<List<EventAttendee>> getAttendees(String id, {String status = 'going'});
}
