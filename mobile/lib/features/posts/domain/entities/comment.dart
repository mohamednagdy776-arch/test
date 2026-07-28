// One reaction row embedded on a comment -- backend/src/comments/entities/
// comment-reaction.entity.ts. The nested comment tree (GET
// posts/:postId/comments) only loads the `reactions` relation itself, not
// `reactions.user` (confirmed live: entries carry `userId`/`type`/`id`, no
// nested `user` object) -- so "my reaction" is derived client-side by
// matching `userId` against the signed-in user's id, same as the post-level
// `userReaction` field the reactions endpoint computes server-side.
class CommentReactionEntry {
  final String userId;
  final String type;
  const CommentReactionEntry({required this.userId, required this.type});

  factory CommentReactionEntry.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;
    return CommentReactionEntry(
      userId: (json['userId'] as String?) ?? (user?['id'] as String?) ?? '',
      type: json['type'] as String,
    );
  }
}

// Matches GET posts/:postId/comments's live response shape
// (backend/src/comments/services/comments.service.ts's findByPost/
// buildNestedComments): a fully nested tree where each comment already
// carries its own `replies` array, not the flat+PaginationDto shape the
// sibling endpoints implied. No pagination is applied here as a result --
// v1 scope assumes a single post's comment thread loads in one shot, the
// same simplification the web client makes (CommentSection renders the
// entire useComments() result with no "load more").
class Comment {
  final String id;
  final String content;
  final String? parentId;
  final int depth;
  final bool isPinned;
  final DateTime? editedAt;
  final DateTime createdAt;
  final String authorId;
  final String authorName;
  final String? authorUsername;
  final String? authorAvatarUrl;
  final List<CommentReactionEntry> reactions;
  final List<Comment> replies;

  const Comment({
    required this.id,
    required this.content,
    this.parentId,
    this.depth = 0,
    this.isPinned = false,
    this.editedAt,
    required this.createdAt,
    required this.authorId,
    required this.authorName,
    this.authorUsername,
    this.authorAvatarUrl,
    this.reactions = const [],
    this.replies = const [],
  });

  Map<String, int> get reactionCounts {
    final counts = <String, int>{};
    for (final r in reactions) {
      counts[r.type] = (counts[r.type] ?? 0) + 1;
    }
    return counts;
  }

  String? myReactionType(String? myUserId) {
    if (myUserId == null) return null;
    for (final r in reactions) {
      if (r.userId == myUserId) return r.type;
    }
    return null;
  }

  factory Comment.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;
    final profile = user?['profile'] as Map<String, dynamic>?;
    final firstLast =
        '${user?['firstName'] ?? ''} ${user?['lastName'] ?? ''}'.trim();

    return Comment(
      id: json['id'] as String,
      content: json['content'] as String? ?? '',
      parentId: json['parentId'] as String?,
      depth: json['depth'] as int? ?? 0,
      isPinned: json['isPinned'] as bool? ?? false,
      editedAt: json['editedAt'] != null
          ? DateTime.tryParse(json['editedAt'] as String)
          : null,
      createdAt: DateTime.parse(json['createdAt'] as String),
      authorId: user?['id'] as String? ?? '',
      authorName: (profile?['fullName'] as String?)?.trim().isNotEmpty == true
          ? profile!['fullName'] as String
          : (firstLast.isNotEmpty
              ? firstLast
              : (user?['fullName'] as String? ?? 'مستخدم')),
      authorUsername: user?['username'] as String?,
      authorAvatarUrl: profile?['avatarUrl'] as String?,
      reactions: (json['reactions'] as List<dynamic>? ?? const [])
          .map((e) => CommentReactionEntry.fromJson(e as Map<String, dynamic>))
          .toList(),
      replies: (json['replies'] as List<dynamic>? ?? const [])
          .map((e) => Comment.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  Comment copyWith({
    String? content,
    DateTime? editedAt,
    List<CommentReactionEntry>? reactions,
    List<Comment>? replies,
  }) {
    return Comment(
      id: id,
      content: content ?? this.content,
      parentId: parentId,
      depth: depth,
      isPinned: isPinned,
      editedAt: editedAt ?? this.editedAt,
      createdAt: createdAt,
      authorId: authorId,
      authorName: authorName,
      authorUsername: authorUsername,
      authorAvatarUrl: authorAvatarUrl,
      reactions: reactions ?? this.reactions,
      replies: replies ?? this.replies,
    );
  }
}
