import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';
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

  // POST /chat/messages's response body does NOT echo back replyToId (or
  // mediaUrl) -- curl-verified live: sending {content, type, replyToId}
  // returns only {id, conversationId, senderId, content, type,
  // storySnapshotUrl, createdAt}. Callers must re-attach replyToId/mediaUrl
  // themselves from what they sent, not from this response.
  Future<Map<String, dynamic>> sendMessage(
    String conversationId,
    String content, {
    String? replyToId,
    String type = 'text',
    String? mediaUrl,
  }) async {
    final response = await _dio.post('/chat/messages', data: {
      'conversationId': conversationId,
      'content': content,
      'type': type,
      if (replyToId != null) 'replyToId': replyToId,
      if (mediaUrl != null) 'mediaUrl': mediaUrl,
    });
    return ApiResponse.unwrap(response);
  }

  Future<void> markSeen(String conversationId) async {
    await _dio.post('/chat/conversations/$conversationId/read');
  }

  // One reaction per user per message -- toggling the same emoji removes it,
  // a different emoji replaces it (curl-verified: POST always returns 201
  // with { action: 'added'|'updated'|'removed', emoji }).
  Future<String> reactToMessage(String messageId, String emoji) async {
    final response = await _dio.post('/chat/messages/$messageId/reactions', data: {'emoji': emoji});
    final body = ApiResponse.unwrap(response);
    return body['action'] as String? ?? 'added';
  }

  Future<void> removeReaction(String messageId) async {
    await _dio.delete('/chat/messages/$messageId/reactions');
  }

  // deleteForEveryone:true is a real tombstone (curl-verified: content comes
  // back null, isDeletedForEveryone true, row stays in the list) and is only
  // allowed on the caller's own message (403 otherwise). deleteForEveryone:
  // false ("delete for me") is curl-verified to actually remove the message
  // for BOTH participants server-side (chat.service.ts's plain
  // @DeleteDateColumn soft-delete has no per-user scoping) -- a backend
  // limitation, not something this client can fix; the client still offers
  // both options to match web/ChatWindow.tsx's UI exactly.
  Future<void> deleteMessage(String messageId, {required bool forEveryone}) async {
    await _dio.delete('/chat/messages/$messageId', data: {'deleteForEveryone': forEveryone});
  }

  // Same shared upload endpoint as StoriesRemoteDataSource.uploadMedia
  // (POST /upload/media) -- curl-verified: returns { url, type, filename }.
  Future<String> uploadMedia(XFile file) async {
    final bytes = await file.readAsBytes();
    final formData = FormData.fromMap({
      'file': MultipartFile.fromBytes(bytes, filename: file.name),
    });
    final response = await _dio.post('/upload/media', data: formData);
    return ApiResponse.unwrap(response)['url'] as String;
  }
}
