import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/api/api_response.dart';

class EventsRemoteDataSource {
  final Dio _dio;
  const EventsRemoteDataSource(this._dio);

  // GET /events/upcoming is a byte-for-byte duplicate of GET /events on this
  // backend (events.controller.ts's upcoming() calls the exact same
  // eventsService.findAll() as findAll() itself, with no extra filtering) --
  // curl-confirmed identical responses. Deliberately not wiring up a second
  // call to it; the list screen just uses /events.
  Future<PaginatedResult<Map<String, dynamic>>> getEvents({int page = 1, int limit = 20}) async {
    final response = await _dio.get('/events', queryParameters: {'page': page, 'limit': limit});
    return ApiResponse.unwrapPaginated(response, (json) => json);
  }

  Future<List<dynamic>> getMyEvents() async {
    final response = await _dio.get('/events/my');
    return ApiResponse.unwrapList(response);
  }

  Future<Map<String, dynamic>> getEvent(String id) async {
    final response = await _dio.get('/events/$id');
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> createEvent({
    required String title,
    String? description,
    required String startDate,
    String? endDate,
    String? location,
    String privacy = 'public',
    XFile? coverPhoto,
  }) async {
    // @IsOptional() only skips null/undefined, never '' -- filter unset/empty
    // optional fields before sending (project-wide gotcha).
    final fields = {
      'title': title,
      'startDate': startDate,
      'privacy': privacy,
      if (description != null && description.isNotEmpty) 'description': description,
      if (endDate != null && endDate.isNotEmpty) 'endDate': endDate,
      if (location != null && location.isNotEmpty) 'location': location,
    };
    final response = coverPhoto == null
        ? await _dio.post('/events', data: fields)
        : await _dio.post('/events', data: FormData.fromMap({
            ...fields,
            'coverPhoto': MultipartFile.fromBytes(await coverPhoto.readAsBytes(), filename: coverPhoto.name),
          }));
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> updateEvent(
    String id, {
    String? title,
    String? description,
    String? location,
    String? startDate,
    String? endDate,
    String? privacy,
    XFile? coverPhoto,
  }) async {
    final fields = {
      if (title != null && title.isNotEmpty) 'title': title,
      if (description != null && description.isNotEmpty) 'description': description,
      if (location != null && location.isNotEmpty) 'location': location,
      if (startDate != null && startDate.isNotEmpty) 'startDate': startDate,
      if (endDate != null && endDate.isNotEmpty) 'endDate': endDate,
      if (privacy != null && privacy.isNotEmpty) 'privacy': privacy,
    };
    final response = coverPhoto == null
        ? await _dio.patch('/events/$id', data: fields)
        : await _dio.patch('/events/$id', data: FormData.fromMap({
            ...fields,
            'coverPhoto': MultipartFile.fromBytes(await coverPhoto.readAsBytes(), filename: coverPhoto.name),
          }));
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> rsvp(String id, String status) async {
    final response = await _dio.post('/events/$id/rsvp', data: {'status': status});
    return ApiResponse.unwrap(response);
  }

  Future<List<dynamic>> getAttendees(String id, {String status = 'going'}) async {
    final response = await _dio.get('/events/$id/attendees', queryParameters: {'status': status});
    return ApiResponse.unwrapList(response);
  }
}
