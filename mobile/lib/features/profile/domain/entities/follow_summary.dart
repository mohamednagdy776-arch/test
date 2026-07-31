// GET /users/:id/follow-status and /follow-counts (backend/src/follows/
// controllers/follows.controller.ts) -- curl-verified live. Distinct table
// from the friends system (Follow entity), but /friends/follow/:userId
// (already wired in FriendRelationsUseCase) writes to the exact same
// followsRepo, so those existing follow()/unfollow() methods are reused for
// the action -- only the status/count reads are new here.
class FollowStatus {
  final bool following;
  const FollowStatus({required this.following});

  factory FollowStatus.fromJson(Map<String, dynamic> json) => FollowStatus(
        following: json['following'] as bool? ?? false,
      );
}

class FollowCounts {
  final int followers;
  final int following;
  const FollowCounts({this.followers = 0, this.following = 0});

  factory FollowCounts.fromJson(Map<String, dynamic> json) => FollowCounts(
        followers: json['followers'] as int? ?? 0,
        following: json['following'] as int? ?? 0,
      );
}
