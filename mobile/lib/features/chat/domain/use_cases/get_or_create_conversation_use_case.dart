import '../entities/conversation.dart';
import '../repositories/chat_repository.dart';

class GetOrCreateConversationUseCase {
  final ChatRepository _repository;
  const GetOrCreateConversationUseCase(this._repository);

  Future<Conversation> call(String targetUserId) => _repository.createConversation(targetUserId);
}
