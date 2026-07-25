import 'package:dio/dio.dart';
import '../../../../core/api/api_response.dart';

class ChatRemoteDataSource {
  final Dio _dio;
  const ChatRemoteDataSource(this._dio);

  Future<List<dynamic>> getConversations() async {
    final response = await _dio.get('/chat/conversations');
    return ApiResponse.unwrapList(response);
  }

  Future<Map<String, dynamic>> createConversation(String targetUserId) async {
    final response = await _dio.post('/chat/conversations', data: {'targetUserId': targetUserId});
    return ApiResponse.unwrap(response);
  }

  // { data: [...], total, otherLastReadAt } -- a third distinct envelope
  // shape (curl-verified), unrelated to both the meta-paginated and
  // cursor-paginated ones already handled elsewhere.
  Future<(List<dynamic>, DateTime?)> getMessages(String conversationId, {int page = 1, int limit = 50}) async {
    final response = await _dio.get(
      '/chat/conversations/$conversationId/messages',
      queryParameters: {'page': page, 'limit': limit},
    );
    final body = ApiResponse.unwrap(response);
    final otherLastReadAt = body['otherLastReadAt'] as String?;
    return (body['data'] as List<dynamic>, otherLastReadAt != null ? DateTime.parse(otherLastReadAt) : null);
  }

  Future<Map<String, dynamic>> sendMessage(String conversationId, String content, {String? replyToId}) async {
    final response = await _dio.post('/chat/messages', data: {
      'conversationId': conversationId,
      'content': content,
      'type': 'text',
      if (replyToId != null) 'replyToId': replyToId,
    });
    return ApiResponse.unwrap(response);
  }

  Future<void> markSeen(String conversationId) async {
    await _dio.post('/chat/conversations/$conversationId/read');
  }
}
