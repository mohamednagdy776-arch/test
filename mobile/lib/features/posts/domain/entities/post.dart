class Post {
  final String id;
  final String groupId;
  final String userId;
  final String content;
  final String? mediaUrl;
  final DateTime createdAt;

  const Post({
    required this.id,
    required this.groupId,
    required this.userId,
    required this.content,
    this.mediaUrl,
    required this.createdAt,
  });

  factory Post.fromJson(Map<String, dynamic> json) {
    return Post(
      id: json['id'] as String,
      groupId: json['groupId'] as String,
      userId: json['userId'] as String,
      content: json['content'] as String,
      mediaUrl: json['mediaUrl'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
