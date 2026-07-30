class BlockedUser {
  final String id;
  final String blockedUserId;
  final String name;
  final String username;

  const BlockedUser({
    required this.id,
    required this.blockedUserId,
    required this.name,
    required this.username,
  });

  factory BlockedUser.fromJson(Map<String, dynamic> json) {
    final blocked = json['blocked'] as Map<String, dynamic>?;
    return BlockedUser(
      id: json['id'] as String? ?? '',
      blockedUserId: blocked?['id'] as String? ?? '',
      name: blocked?['name'] as String? ?? blocked?['fullName'] as String? ?? '',
      username: blocked?['username'] as String? ?? '',
    );
  }
}

class PhotoAccessRequest {
  final String id;
  final String requesterName;
  final String? requesterUsername;

  const PhotoAccessRequest({
    required this.id,
    required this.requesterName,
    this.requesterUsername,
  });

  factory PhotoAccessRequest.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;
    return PhotoAccessRequest(
      id: json['id'] as String? ?? '',
      requesterName: user?['fullName'] as String? ?? 'مستخدم',
      requesterUsername: user?['username'] as String?,
    );
  }
}
