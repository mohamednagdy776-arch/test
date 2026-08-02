import 'package:dio/dio.dart';
import '../../../../core/api/api_response.dart';

class MatchingRemoteDataSource {
  final Dio _dio;
  const MatchingRemoteDataSource(this._dio);

  // minAge/maxAge/location/religiousCommitment are all real server-side
  // filters (curl-verified live against /matches) -- backend/src/matching/
  // controllers/matching.controller.ts's getMatches() forwards them straight
  // into the query, unlike the web page's own religiousCommitment param which
  // used to be silently dropped before it was wired up server-side (#257).
  Future<PaginatedResult<Map<String, dynamic>>> getMatches({
    String? status,
    int page = 1,
    int limit = 20,
    int? minAge,
    int? maxAge,
    String? location,
    String? religiousCommitment,
  }) async {
    final response = await _dio.get('/matches', queryParameters: {
      if (status != null) 'status': status,
      'page': page,
      'limit': limit,
      if (minAge != null) 'minAge': minAge,
      if (maxAge != null) 'maxAge': maxAge,
      if (location != null && location.isNotEmpty) 'location': location,
      if (religiousCommitment != null && religiousCommitment.isNotEmpty) 'religiousCommitment': religiousCommitment,
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
