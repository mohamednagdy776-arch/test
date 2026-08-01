import 'package:image_picker/image_picker.dart';
import '../entities/message.dart';
import '../repositories/chat_repository.dart';

// Bundles the actions a chat-thread screen needs (fetch history, send,
// mark read, react, delete, upload) into one class instead of many
// near-identical files -- same consolidation as RespondToMatchUseCase in
// Phase 5.
class ChatThreadUseCase {
  final ChatRepository _repository;
  const ChatThreadUseCase(this._repository);

  Future<(List<Message>, DateTime?)> getMessages(String conversationId, {int page = 1, int limit = 50}) {
    return _repository.getMessages(conversationId, page: page, limit: limit);
  }

  Future<Message> sendMessage(
    String conversationId,
    String content, {
    String? replyToId,
    String type = 'text',
    String? mediaUrl,
  }) {
    return _repository.sendMessage(conversationId, content, replyToId: replyToId, type: type, mediaUrl: mediaUrl);
  }

  Future<void> markSeen(String conversationId) => _repository.markSeen(conversationId);

  Future<String> reactToMessage(String messageId, String emoji) => _repository.reactToMessage(messageId, emoji);

  Future<void> removeReaction(String messageId) => _repository.removeReaction(messageId);

  Future<void> deleteMessage(String messageId, {required bool forEveryone}) =>
      _repository.deleteMessage(messageId, forEveryone: forEveryone);

  Future<String> uploadMedia(XFile file) => _repository.uploadMedia(file);
}
