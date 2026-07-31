import '../entities/follow_summary.dart';
import '../repositories/profile_repository.dart';

// Read-only follow status/counts for the profile header's follower/following
// pills + follow button state (web's FollowSection.tsx). The follow/unfollow
// ACTION itself reuses FriendRelationsUseCase.follow/unfollow from the
// friends feature (same underlying Follow table, verified via curl + source
// -- friends.controller.ts's /friends/follow/:userId and follows.controller.
// ts's /users/:id/follow both write followsRepo), so it isn't duplicated here.
class GetFollowSummaryUseCase {
  final ProfileRepository _repository;
  const GetFollowSummaryUseCase(this._repository);

  Future<FollowStatus> status(String userId) => _repository.getFollowStatus(userId);
  Future<FollowCounts> counts(String userId) => _repository.getFollowCounts(userId);
}
