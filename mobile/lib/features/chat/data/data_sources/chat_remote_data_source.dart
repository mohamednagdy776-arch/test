import 'package:dio/dio.dart';

class ChatRemoteDataSource {
  final Dio _dio;

  ChatRemoteDataSource(this._dio);

  Future<List<dynamic>> getMessages(String matchId, {int page = 1, int limit = 50}) async {
    final response = await _dio.get('/chat/$matchId/messages', queryParameters: {'page': page, 'limit': limit});
    return response.data['data'];
  }

  Future<Map<String, dynamic>> sendMessage(String matchId, String content) async {
    final response = await _dio.post('/chat/messages', data: {'matchId': matchId, 'content': content});
    return response.data['data'];
  }

  Future<Map<String, dynamic>> createConversation(String targetUserId) async {
    final response = await _dio.post('/chat/conversations', data: {'targetUserId': targetUserId});
    return response.data['data'];
  }
}
