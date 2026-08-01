// Matches the feed's actual live response shape (backend/src/posts/entities/post.entity.ts
// serialized close-to-raw by GET /feed -- confirmed against a live response,
// not just the entity source, since the feed item isn't run through a
// dedicated formatter the way profile/video entities are). No comment/
// reaction count fields exist in this payload (view + create only is the
// locked v1 scope, so this doesn't need to model reactions/comments at all).
//
// Phase 23 extends this with the composer/menu fields (bgColor, feeling,
// location, audience, pollOptions/myVote, editedAt) confirmed live against
// POST /posts and GET /posts/:id -- all present on the same flat object, no
// separate formatter for these either.
import 'poll_option.dart';

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
  final String audience;
  final String? bgColor;
  final String? feeling;
  final String? location;
  final DateTime? editedAt;
  final List<PollOption>? pollOptions;
  // Only ever populated by a non-owner GET /posts/:id or a feed listing (both
  // go through the backend's sanitizePolls()); the owner's own GET /posts/:id
  // never carries this field at all (see poll_option.dart's PollOption doc
  // comment) -- callers needing the owner's own vote must fall back to
  // scanning pollOptions[i].voterIds themselves.
  final int? myVote;
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
    this.audience = 'friends',
    this.bgColor,
    this.feeling,
    this.location,
    this.editedAt,
    this.pollOptions,
    this.myVote,
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
      audience: json['audience'] as String? ?? 'friends',
      bgColor: json['bgColor'] as String?,
      feeling: json['feeling'] as String?,
      location: json['location'] as String?,
      editedAt: json['editedAt'] != null ? DateTime.tryParse(json['editedAt'] as String) : null,
      pollOptions: (json['pollOptions'] as List<dynamic>?)
          ?.map((e) => PollOption.fromJson(e as Map<String, dynamic>))
          .toList(),
      myVote: json['myVote'] as int?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      authorName: (profile?['fullName'] as String?)?.trim().isNotEmpty == true
          ? profile!['fullName'] as String
          : (firstLast.isNotEmpty ? firstLast : (user?['fullName'] as String? ?? 'مستخدم')),
      authorUsername: user?['username'] as String?,
      authorAvatarUrl: profile?['avatarUrl'] as String?,
    );
  }

  Post copyWith({
    List<PollOption>? pollOptions,
    int? myVote,
    bool? isArchived,
  }) {
    return Post(
      id: id,
      userId: userId,
      content: content,
      mediaUrl: mediaUrl,
      mediaUrls: mediaUrls,
      mediaType: mediaType,
      postType: postType,
      isPinned: isPinned,
      isArchived: isArchived ?? this.isArchived,
      audience: audience,
      bgColor: bgColor,
      feeling: feeling,
      location: location,
      editedAt: editedAt,
      pollOptions: pollOptions ?? this.pollOptions,
      myVote: myVote ?? this.myVote,
      createdAt: createdAt,
      authorName: authorName,
      authorUsername: authorUsername,
      authorAvatarUrl: authorAvatarUrl,
    );
  }
}
