import '../entities/friend_request.dart';
import '../entities/friend_suggestion.dart';
import '../repositories/friends_repository.dart';

class GetFriendRequestsUseCase {
  final FriendsRepository _repository;
  const GetFriendRequestsUseCase(this._repository);

  Future<List<FriendRequest>> incoming() => _repository.getIncomingRequests();
  Future<List<FriendRequest>> sent() => _repository.getSentRequests();
  Future<List<FriendSuggestion>> suggestions({int limit = 10}) =>
      _repository.getSuggestions(limit: limit);
}
