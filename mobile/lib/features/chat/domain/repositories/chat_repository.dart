import 'package:image_picker/image_picker.dart';
import '../entities/conversation.dart';
import '../entities/message.dart';

abstract class ChatRepository {
  Future<List<Conversation>> getConversations();
  Future<Conversation> createConversation(String targetUserId);
  Future<(List<Message>, DateTime?)> getMessages(String conversationId, {int page = 1, int limit = 50});
  Future<Message> sendMessage(
    String conversationId,
    String content, {
    String? replyToId,
    String type = 'text',
    String? mediaUrl,
  });
  Future<void> markSeen(String conversationId);

  // Phase 22: message reactions, delete-for-me/everyone, and image upload --
  // curl-verified against the live backend (see chat.service.ts's
  // reactToMessage/deleteMessage).
  Future<String> reactToMessage(String messageId, String emoji);
  Future<void> removeReaction(String messageId);
  Future<void> deleteMessage(String messageId, {required bool forEveryone});
  Future<String> uploadMedia(XFile file);
}
