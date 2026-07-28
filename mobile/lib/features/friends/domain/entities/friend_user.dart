// Flattened user shape shared by GET /friends/list, /friends/requests(/sent),
// and /friends/suggestions (via its `userId` sub-object) -- curl-verified
// against the live VPS. Fields come back at the top level (firstName,
// lastName, username, fullName, gender...) with an optional nested `profile`
// (null on fresh accounts) holding avatarUrl/bio.
class FriendUser {
  final String id;
  final String fullName;
  final String? username;
  final String? avatarUrl;
  final String? bio;

  const FriendUser({
    required this.id,
    required this.fullName,
    this.username,
    this.avatarUrl,
    this.bio,
  });

  factory FriendUser.fromJson(Map<String, dynamic> json) {
    final profile = json['profile'] as Map<String, dynamic>?;
    final firstLast = '${json['firstName'] ?? ''} ${json['lastName'] ?? ''}'.trim();
    return FriendUser(
      id: json['id'] as String,
      fullName: (json['fullName'] as String?) ??
          (firstLast.isNotEmpty ? firstLast : 'مستخدم'),
      username: json['username'] as String?,
      avatarUrl: (json['avatar'] as String?) ?? profile?['avatarUrl'] as String?,
      bio: profile?['bio'] as String?,
    );
  }
}
