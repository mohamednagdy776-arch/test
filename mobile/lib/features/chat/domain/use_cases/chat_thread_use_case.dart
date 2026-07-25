import '../entities/message.dart';
import '../repositories/chat_repository.dart';

// Bundles the 3 actions a chat-thread screen needs (fetch history, send,
// mark read) into one class instead of three near-identical files -- same
// consolidation as RespondToMatchUseCase in Phase 5.
class ChatThreadUseCase {
  final ChatRepository _repository;
  const ChatThreadUseCase(this._repository);

  Future<(List<Message>, DateTime?)> getMessages(String conversationId, {int page = 1, int limit = 50}) {
    return _repository.getMessages(conversationId, page: page, limit: limit);
  }

  Future<Message> sendMessage(String conversationId, String content, {String? replyToId}) {
    return _repository.sendMessage(conversationId, content, replyToId: replyToId);
  }

  Future<void> markSeen(String conversationId) => _repository.markSeen(conversationId);
}
