import 'package:dio/dio.dart';
import '../../../../core/api/api_response.dart';

// Routes live under /users (backend/src/interests/interests.controller.ts's
// own comment: "to match the spec (#754)"), not /interests -- a separate
// controller keeps the concern out of the already-large UsersController.
class InterestsRemoteDataSource {
  final Dio _dio;
  const InterestsRemoteDataSource(this._dio);

  Future<List<Map<String, dynamic>>> getReceived() async {
    final response = await _dio.get('/users/me/interests/received');
    return ApiResponse.unwrapList(response).cast<Map<String, dynamic>>();
  }

  Future<List<Map<String, dynamic>>> getSent() async {
    final response = await _dio.get('/users/me/interests/sent');
    return ApiResponse.unwrapList(response).cast<Map<String, dynamic>>();
  }

  Future<PaginatedResult<Map<String, dynamic>>> getProfileViews({int page = 1, int limit = 20}) async {
    final response = await _dio.get('/users/me/profile-views', queryParameters: {'page': page, 'limit': limit});
    return ApiResponse.unwrapPaginated(response, (json) => json);
  }

  Future<Map<String, dynamic>> sendInterest(String userId) async {
    final response = await _dio.post('/users/$userId/interest');
    return ApiResponse.unwrap(response);
  }

  Future<void> withdrawInterest(String userId) async {
    await _dio.delete('/users/$userId/interest');
  }
}
