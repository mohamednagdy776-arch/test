import '../entities/friendship_status.dart';
import '../repositories/friends_repository.dart';

// Bundles the "relationship toggle" actions that aren't part of the
// request/accept/decline flow -- unfriend, follow, block -- plus the
// status lookup, mirroring RespondToMatchUseCase's multi-method shape.
class FriendRelationsUseCase {
  final FriendsRepository _repository;
  const FriendRelationsUseCase(this._repository);

  Future<FriendshipStatus> status(String userId) => _repository.getStatus(userId);
  Future<void> unfriend(String userId) => _repository.unfriend(userId);
  Future<void> follow(String userId) => _repository.follow(userId);
  Future<void> unfollow(String userId) => _repository.unfollow(userId);
  Future<void> block(String userId) => _repository.block(userId);
  Future<void> unblock(String userId) => _repository.unblock(userId);
}
