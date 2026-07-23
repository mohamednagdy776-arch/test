import 'package:dio/dio.dart';
import '../../../../core/api/api_response.dart';

class MatchingRemoteDataSource {
  final Dio _dio;
  const MatchingRemoteDataSource(this._dio);

  Future<PaginatedResult<Map<String, dynamic>>> getMatches({String? status, int page = 1, int limit = 20}) async {
    final response = await _dio.get('/matches', queryParameters: {
      if (status != null) 'status': status,
      'page': page,
      'limit': limit,
    });
    return ApiResponse.unwrapPaginated(response, (json) => json);
  }

  Future<void> generateMatches() async {
    await _dio.post('/matches/generate');
  }

  Future<Map<String, dynamic>> getMatchProfile(String userId) async {
    final response = await _dio.get('/matches/profile/$userId');
    return ApiResponse.unwrap(response);
  }

  Future<void> acceptMatch(String id) async {
    await _dio.patch('/matches/$id/accept');
  }

  Future<void> rejectMatch(String id) async {
    await _dio.patch('/matches/$id/reject');
  }

  Future<void> undoAccept(String id) async {
    await _dio.patch('/matches/$id/undo-accept');
  }

  Future<void> undoReject(String id) async {
    await _dio.patch('/matches/$id/undo-reject');
  }
}
