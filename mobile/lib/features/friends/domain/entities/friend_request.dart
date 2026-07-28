import 'friend_user.dart';

// GET /friends/requests(/incoming) nests the other user under `requester`;
// GET /friends/requests/sent nests it under `addressee` -- curl-verified.
// Both shapes otherwise share id/status/createdAt at the top level.
class FriendRequest {
  final String id;
  final String status;
  final DateTime createdAt;
  final FriendUser user;

  const FriendRequest({
    required this.id,
    required this.status,
    required this.createdAt,
    required this.user,
  });

  factory FriendRequest.fromJson(Map<String, dynamic> json, {required bool incoming}) {
    final userKey = incoming ? 'requester' : 'addressee';
    final userIdKey = incoming ? 'requesterId' : 'addresseeId';
    final userJson = json[userKey] as Map<String, dynamic>?;
    return FriendRequest(
      id: json['id'] as String,
      status: json['status'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      user: userJson != null
          ? FriendUser.fromJson(userJson)
          : FriendUser(id: json[userIdKey] as String, fullName: 'مستخدم'),
    );
  }
}
