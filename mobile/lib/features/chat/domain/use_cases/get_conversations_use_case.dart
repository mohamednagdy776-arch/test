import '../entities/conversation.dart';
import '../repositories/chat_repository.dart';

class GetConversationsUseCase {
  final ChatRepository _repository;
  const GetConversationsUseCase(this._repository);

  Future<List<Conversation>> call() => _repository.getConversations();
}
