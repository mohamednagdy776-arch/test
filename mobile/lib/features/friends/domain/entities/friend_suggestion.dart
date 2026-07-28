import 'friend_user.dart';

// GET /friends/suggestions returns [{ userId: <hydrated User+profile>, mutual: number }]
// -- the candidate user is nested *under* the `userId` key as a full object,
// not a bare id string (backend/src/friends/services/friends.service.ts's
// getSuggestions comment confirms this was a deliberate fix). Only ever
// non-empty once the requesting user has at least one accepted friendship
// (mutual-friend based), which the live curl round-trip couldn't exercise
// with two fresh throwaway accounts -- shape taken from the service source
// plus the matching frontend usage (`s.userId?.profile?.avatarUrl`).
class FriendSuggestion {
  final FriendUser user;
  final int mutual;

  const FriendSuggestion({required this.user, required this.mutual});

  factory FriendSuggestion.fromJson(Map<String, dynamic> json) {
    final userJson = json['userId'] as Map<String, dynamic>;
    return FriendSuggestion(
      user: FriendUser.fromJson(userJson),
      mutual: json['mutual'] as int? ?? 0,
    );
  }
}
