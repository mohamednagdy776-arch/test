import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/api/api_response.dart';

class ProfileRemoteDataSource {
  final Dio _dio;

  ProfileRemoteDataSource(this._dio);

  Future<Map<String, dynamic>> getMyProfile() async {
    final response = await _dio.get('/users/me');
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    final response = await _dio.patch('/users/me', data: data);
    return ApiResponse.unwrap(response);
  }

  // Reads bytes instead of using MultipartFile.fromFile(path) -- XFile's path
  // isn't a real filesystem path on web, so byte-reading is the one approach
  // that works on every platform.
  Future<Map<String, dynamic>> uploadAvatar(XFile file) async {
    final bytes = await file.readAsBytes();
    final formData = FormData.fromMap({
      'file': MultipartFile.fromBytes(bytes, filename: file.name),
    });
    final response = await _dio.post('/users/me/avatar', data: formData);
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> getUserProfile(String userId) async {
    final response = await _dio.get('/users/$userId/profile');
    return ApiResponse.unwrap(response);
  }

  // GET /users/:id -- the REAL authenticated in-app profile view (curl-
  // verified live). Distinct from getUserProfile() above, which hits the
  // thinner `:id/profile` route (no friendshipStatus, no view-recording, no
  // block-enforcement) -- kept separate rather than repointing that unused
  // method, since its return type (Profile) doesn't carry the extra fields
  // this needs anyway.
  Future<Map<String, dynamic>> getFullProfile(String userId) async {
    final response = await _dio.get('/users/$userId');
    return ApiResponse.unwrap(response);
  }

  Future<PaginatedResult<Map<String, dynamic>>> getUserPosts(String userId, {int page = 1, int limit = 10}) async {
    final response = await _dio.get('/users/$userId/posts', queryParameters: {'page': page, 'limit': limit});
    return ApiResponse.unwrapPaginated(response, (json) => json);
  }

  // GET /users/:id/friends -- unlike /posts above, this is NOT the meta-
  // paginated envelope: the whole `{ data: [...], total }` object sits under
  // the outer `data` key with no `meta` at all (curl-verified; matches web's
  // `(data as any)?.data?.data ?? []`).
  Future<List<Map<String, dynamic>>> getUserFriends(String userId, {int page = 1, int limit = 20}) async {
    final response = await _dio.get('/users/$userId/friends', queryParameters: {'page': page, 'limit': limit});
    final body = ApiResponse.unwrap(response);
    return (body['data'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? const [];
  }

  // GET /users/:id/photos -- also nested under `data` (not meta-paginated),
  // but this variant DOES carry page/totalPages inside that nested object
  // (curl-verified) -- a third, different envelope shape from posts/friends.
  Future<List<Map<String, dynamic>>> getUserPhotos(String userId, {int page = 1, int limit = 20}) async {
    final response = await _dio.get('/users/$userId/photos', queryParameters: {'page': page, 'limit': limit});
    final body = ApiResponse.unwrap(response);
    return (body['data'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? const [];
  }

  Future<List<Map<String, dynamic>>> getUserVideos(String userId, {int page = 1, int limit = 20}) async {
    final response = await _dio.get('/users/$userId/videos', queryParameters: {'page': page, 'limit': limit});
    final body = ApiResponse.unwrap(response);
    return (body['data'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? const [];
  }

  Future<Map<String, dynamic>> getFollowStatus(String userId) async {
    final response = await _dio.get('/users/$userId/follow-status');
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> getFollowCounts(String userId) async {
    final response = await _dio.get('/users/$userId/follow-counts');
    return ApiResponse.unwrap(response);
  }

  Future<void> reportUser(String userId, String reason, String? details) async {
    await _dio.post('/users/$userId/report', data: {
      'reason': reason,
      if (details != null && details.isNotEmpty) 'details': details,
    });
  }

  Future<List<Map<String, dynamic>>> getReportReasons() async {
    final response = await _dio.get('/reports/reasons');
    return ApiResponse.unwrapList(response).cast<Map<String, dynamic>>();
  }

  // GET /users/:id/activity -- private to its owner (server 403s any other
  // id, curl-verified live), so callers must only ever pass the current
  // user's own id. Empty year/type are omitted rather than sent as '' -- an
  // empty `type` fails the backend's enum validation with a 400 (#832).
  Future<Map<String, dynamic>> getActivityLog(String userId, {String? year, String? type, int page = 1, int limit = 20}) async {
    final response = await _dio.get('/users/$userId/activity', queryParameters: {
      'page': page,
      'limit': limit,
      if (year != null && year.isNotEmpty) 'year': year,
      if (type != null && type.isNotEmpty) 'type': type,
    });
    return ApiResponse.unwrap(response);
  }
}
