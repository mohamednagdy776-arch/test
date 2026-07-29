// GET/POST videos/:id/comments's live shape (VideosService.getComments/
// addComment, confirmed via curl): flat, no replies/reactions nesting
// (unlike posts' comment tree) and no edit indicator field -- `editedAt` is
// never returned even after PATCH, so the UI can't show an "(edited)" tag
// the way post comments can.
class VideoComment {
  final String id;
  final String content;
  final DateTime createdAt;
  final String? authorId;
  final String authorName;
  final String? authorUsername;
  final String? authorAvatarUrl;

  const VideoComment({
    required this.id,
    required this.content,
    required this.createdAt,
    this.authorId,
    required this.authorName,
    this.authorUsername,
    this.authorAvatarUrl,
  });

  factory VideoComment.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;
    return VideoComment(
      id: json['id'] as String,
      content: json['content'] as String? ?? '',
      createdAt: DateTime.parse(json['createdAt'] as String),
      authorId: user?['id'] as String?,
      authorName: (user?['name'] as String?) ?? 'مستخدم',
      authorUsername: user?['username'] as String?,
      authorAvatarUrl: user?['avatarUrl'] as String?,
    );
  }
}
