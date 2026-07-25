import '../entities/conversation.dart';
import '../entities/message.dart';

abstract class ChatRepository {
  Future<List<Conversation>> getConversations();
  Future<Conversation> createConversation(String targetUserId);
  Future<(List<Message>, DateTime?)> getMessages(String conversationId, {int page = 1, int limit = 50});
  Future<Message> sendMessage(String conversationId, String content, {String? replyToId});
  Future<void> markSeen(String conversationId);
}
