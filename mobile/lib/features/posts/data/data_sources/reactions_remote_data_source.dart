import 'package:dio/dio.dart';
import '../../../../core/api/api_response.dart';

class ReactionsRemoteDataSource {
  final Dio _dio;
  const ReactionsRemoteDataSource(this._dio);

  Future<String?> reactToPost(String postId, String type) async {
    final response =
        await _dio.post('/posts/$postId/reactions', data: {'type': type});
    final data = ApiResponse.unwrap(response);
    return data['type'] as String?;
  }

  Future<Map<String, dynamic>> getReactions(String postId) async {
    final response = await _dio.get('/posts/$postId/reactions');
    return ApiResponse.unwrap(response);
  }

  // `data` is `null` (not an object) when the viewer hasn't reacted --
  // confirmed live -- so ApiResponse.unwrap()'s `as Map` cast would throw;
  // read the envelope directly instead.
  Future<Map<String, dynamic>?> getMyReaction(String postId) async {
    final response = await _dio.get('/posts/$postId/reactions/me');
    final body = response.data as Map<String, dynamic>;
    return body['data'] as Map<String, dynamic>?;
  }

  Future<Map<String, int>> getBreakdown(String postId) async {
    final response = await _dio.get('/posts/$postId/reactions/breakdown');
    final data = ApiResponse.unwrap(response);
    return data.map((key, value) => MapEntry(key, value as int));
  }
}
