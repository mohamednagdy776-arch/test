import '../repositories/friends_repository.dart';

class RespondToFriendRequestUseCase {
  final FriendsRepository _repository;
  const RespondToFriendRequestUseCase(this._repository);

  Future<void> send(String userId) => _repository.sendRequest(userId);
  Future<void> accept(String requestId) => _repository.acceptRequest(requestId);
  Future<void> decline(String requestId) => _repository.declineRequest(requestId);
  Future<void> cancel(String requestId) => _repository.cancelRequest(requestId);
}
