// Matches the feed's actual live response shape (backend/src/posts/entities/post.entity.ts
// serialized close-to-raw by GET /feed -- confirmed against a live response,
// not just the entity source, since the feed item isn't run through a
// dedicated formatter the way profile/video entities are). No comment/
// reaction count fields exist in this payload (view + create only is the
// locked v1 scope, so this doesn't need to model reactions/comments at all).
class Post {
  final String id;
  final String userId;
  final String content;
  final String? mediaUrl;
  final List<String> mediaUrls;
  final String? mediaType;
  final String postType;
  final bool isPinned;
  final bool isArchived;
  final DateTime createdAt;

  // Flattened from the nested user/user.profile objects for display --
  // this endpoint doesn't flatten them server-side the way other modules do.
  final String authorName;
  final String? authorUsername;
  final String? authorAvatarUrl;

  const Post({
    required this.id,
    required this.userId,
    required this.content,
    this.mediaUrl,
    this.mediaUrls = const [],
    this.mediaType,
    this.postType = 'text',
    this.isPinned = false,
    this.isArchived = false,
    required this.createdAt,
    required this.authorName,
    this.authorUsername,
    this.authorAvatarUrl,
  });

  factory Post.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;
    final profile = user?['profile'] as Map<String, dynamic>?;
    final firstLast = '${user?['firstName'] ?? ''} ${user?['lastName'] ?? ''}'.trim();

    return Post(
      id: json['id'] as String,
      userId: json['userId'] as String,
      content: json['content'] as String? ?? '',
      mediaUrl: json['mediaUrl'] as String?,
      mediaUrls: (json['mediaUrls'] as List<dynamic>?)?.cast<String>() ?? const [],
      mediaType: json['mediaType'] as String?,
      postType: json['postType'] as String? ?? 'text',
      isPinned: json['isPinned'] as bool? ?? false,
      isArchived: json['isArchived'] as bool? ?? false,
      createdAt: DateTime.parse(json['createdAt'] as String),
      authorName: (profile?['fullName'] as String?)?.trim().isNotEmpty == true
          ? profile!['fullName'] as String
          : (firstLast.isNotEmpty ? firstLast : (user?['fullName'] as String? ?? 'مستخدم')),
      authorUsername: user?['username'] as String?,
      authorAvatarUrl: profile?['avatarUrl'] as String?,
    );
  }
}
