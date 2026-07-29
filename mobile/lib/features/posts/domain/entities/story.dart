// backend/src/posts/entities/story.entity.ts's live shape (confirmed via
// curl against POST/GET /stories): media/text/bgColor are mutually
// optional (StoriesService.createStory requires at least one), `duration`
// always defaults to 5 server-side even for text/image stories where it's
// meaningless (only read for the auto-advance timer on video/image stories).
class Story {
  final String id;
  final String userId;
  final String? mediaUrl;
  final String? mediaType; // 'image' | 'video'
  final String? thumbnailUrl;
  final String? text;
  final String? bgColor;
  final int duration;
  final bool isArchived;
  final int viewCount;
  final DateTime createdAt;

  final String authorName;
  final String? authorUsername;
  final String? authorAvatarUrl;

  const Story({
    required this.id,
    required this.userId,
    this.mediaUrl,
    this.mediaType,
    this.thumbnailUrl,
    this.text,
    this.bgColor,
    this.duration = 5,
    this.isArchived = false,
    this.viewCount = 0,
    required this.createdAt,
    required this.authorName,
    this.authorUsername,
    this.authorAvatarUrl,
  });

  factory Story.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;
    final profile = user?['profile'] as Map<String, dynamic>?;
    final firstLast =
        '${user?['firstName'] ?? ''} ${user?['lastName'] ?? ''}'.trim();

    return Story(
      id: json['id'] as String,
      userId: json['userId'] as String,
      mediaUrl: json['mediaUrl'] as String?,
      mediaType: json['mediaType'] as String?,
      thumbnailUrl: json['thumbnailUrl'] as String?,
      text: json['text'] as String?,
      bgColor: json['bgColor'] as String?,
      duration: json['duration'] as int? ?? 5,
      isArchived: json['isArchived'] as bool? ?? false,
      viewCount: json['viewCount'] as int? ?? 0,
      createdAt: DateTime.parse(json['createdAt'] as String),
      authorName: (profile?['fullName'] as String?)?.trim().isNotEmpty == true
          ? profile!['fullName'] as String
          : (firstLast.isNotEmpty
              ? firstLast
              : (user?['fullName'] as String? ?? 'مستخدم')),
      authorUsername: user?['username'] as String?,
      authorAvatarUrl: profile?['avatarUrl'] as String?,
    );
  }
}

// GET /stories's live shape: an array of { user, stories } groups, one per
// author, ordered by their most recent story (StoriesService.getAllStories).
class StoryGroup {
  final String userId;
  final String authorName;
  final String? authorUsername;
  final String? authorAvatarUrl;
  final List<Story> stories;

  const StoryGroup({
    required this.userId,
    required this.authorName,
    this.authorUsername,
    this.authorAvatarUrl,
    required this.stories,
  });

  factory StoryGroup.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;
    final profile = user?['profile'] as Map<String, dynamic>?;
    final firstLast =
        '${user?['firstName'] ?? ''} ${user?['lastName'] ?? ''}'.trim();
    final stories = (json['stories'] as List<dynamic>? ?? const [])
        .map((e) => Story.fromJson(e as Map<String, dynamic>))
        .toList();

    return StoryGroup(
      userId: user?['id'] as String? ?? '',
      authorName: (profile?['fullName'] as String?)?.trim().isNotEmpty == true
          ? profile!['fullName'] as String
          : (firstLast.isNotEmpty
              ? firstLast
              : (user?['fullName'] as String? ?? 'مستخدم')),
      authorUsername: user?['username'] as String?,
      authorAvatarUrl: profile?['avatarUrl'] as String?,
      stories: stories,
    );
  }
}

// GET /stories/:id/viewers's entry shape (backend/src/posts/entities/
// story.entity.ts's StoryView) -- owner-only.
class StoryViewer {
  final String userId;
  final String name;
  final String? avatarUrl;
  final DateTime viewedAt;

  const StoryViewer({
    required this.userId,
    required this.name,
    this.avatarUrl,
    required this.viewedAt,
  });

  factory StoryViewer.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;
    final profile = user?['profile'] as Map<String, dynamic>?;
    final firstLast =
        '${user?['firstName'] ?? ''} ${user?['lastName'] ?? ''}'.trim();
    return StoryViewer(
      userId: (json['userId'] as String?) ?? (user?['id'] as String?) ?? '',
      name: (profile?['fullName'] as String?)?.trim().isNotEmpty == true
          ? profile!['fullName'] as String
          : (firstLast.isNotEmpty
              ? firstLast
              : (user?['fullName'] as String? ?? 'مستخدم')),
      avatarUrl: profile?['avatarUrl'] as String?,
      viewedAt: DateTime.parse(json['viewedAt'] as String),
    );
  }
}
