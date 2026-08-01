import 'package:image_picker/image_picker.dart';
import '../../domain/entities/conversation.dart';
import '../../domain/entities/message.dart';
import '../../domain/repositories/chat_repository.dart';
import '../data_sources/chat_remote_data_source.dart';

class ChatRepositoryImpl implements ChatRepository {
  final ChatRemoteDataSource _remoteDataSource;
  const ChatRepositoryImpl(this._remoteDataSource);

  @override
  Future<List<Conversation>> getConversations() async {
    final data = await _remoteDataSource.getConversations();
    return data.map((json) => Conversation.fromJson(json as Map<String, dynamic>)).toList();
  }

  @override
  Future<Conversation> createConversation(String targetUserId) async {
    final data = await _remoteDataSource.createConversation(targetUserId);
    return Conversation.fromJson(data);
  }

  @override
  Future<(List<Message>, DateTime?)> getMessages(String conversationId, {int page = 1, int limit = 50}) async {
    final (data, otherLastReadAt) = await _remoteDataSource.getMessages(conversationId, page: page, limit: limit);
    final messages = data.map((json) => Message.fromJson(json as Map<String, dynamic>)).toList();
    return (messages, otherLastReadAt);
  }

  @override
  Future<Message> sendMessage(
    String conversationId,
    String content, {
    String? replyToId,
    String type = 'text',
    String? mediaUrl,
  }) async {
    final data = await _remoteDataSource.sendMessage(
      conversationId,
      content,
      replyToId: replyToId,
      type: type,
      mediaUrl: mediaUrl,
    );
    return Message.fromJson(data);
  }

  @override
  Future<void> markSeen(String conversationId) => _remoteDataSource.markSeen(conversationId);

  @override
  Future<String> reactToMessage(String messageId, String emoji) =>
      _remoteDataSource.reactToMessage(messageId, emoji);

  @override
  Future<void> removeReaction(String messageId) => _remoteDataSource.removeReaction(messageId);

  @override
  Future<void> deleteMessage(String messageId, {required bool forEveryone}) =>
      _remoteDataSource.deleteMessage(messageId, forEveryone: forEveryone);

  @override
  Future<String> uploadMedia(XFile file) => _remoteDataSource.uploadMedia(file);
}
