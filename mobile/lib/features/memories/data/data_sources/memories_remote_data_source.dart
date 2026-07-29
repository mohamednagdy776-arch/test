import 'package:dio/dio.dart';
import '../../../../core/api/api_response.dart';

class MemoriesRemoteDataSource {
  final Dio _dio;
  const MemoriesRemoteDataSource(this._dio);

  // GET /memories -- backend/src/memories/controllers/memories.controller.ts.
  // Returns a plain (non-paginated) `data` array of the user's own posts
  // whose createdAt falls on today's month/day in a previous year.
  Future<List<Map<String, dynamic>>> getMemories() async {
    final response = await _dio.get('/memories');
    return ApiResponse.unwrapList(response).cast<Map<String, dynamic>>();
  }
}
