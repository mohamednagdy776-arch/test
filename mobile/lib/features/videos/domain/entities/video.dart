// backend/src/videos/entities/video.entity.ts's live shape as normalized by
// VideosService.format() (confirmed via curl): `thumbnailUrl`/`videoUrl` are
// already CDN-resolved by the backend, but per cdn.service.ts's own comment
// ("resolveMediaUrl() on the frontend handles same-origin resolution") they
// still come back as server-root-relative paths, not absolute URLs -- run
// them through resolveMediaUrl() same as every other media field in this
// app. `user` is the flattened uploader summary the cards actually read
// (id/name/username/avatarUrl); the raw nested `createdBy` User is ignored.
class Video {
  final String id;
  final String title;
  final String? description;
  final String? videoUrl;
  final String? thumbnailUrl;
  final int? duration;
  final int viewCount;
  final int likeCount;
  final bool isLiked;
  final bool isReel;
  final DateTime createdAt;

  final String authorId;
  final String authorName;
  final String? authorUsername;
  final String? authorAvatarUrl;

  const Video({
    required this.id,
    required this.title,
    this.description,
    this.videoUrl,
    this.thumbnailUrl,
    this.duration,
    this.viewCount = 0,
    this.likeCount = 0,
    this.isLiked = false,
    this.isReel = false,
    required this.createdAt,
    required this.authorId,
    required this.authorName,
    this.authorUsername,
    this.authorAvatarUrl,
  });

  factory Video.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;
    return Video(
      id: json['id'] as String,
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      videoUrl: (json['videoUrl'] ?? json['url']) as String?,
      thumbnailUrl: (json['thumbnailUrl'] ?? json['thumbnail']) as String?,
      duration: json['duration'] as int?,
      viewCount: (json['viewCount'] ?? json['viewsCount'] ?? json['views']) as int? ?? 0,
      likeCount: (json['likeCount'] ?? json['likesCount']) as int? ?? 0,
      isLiked: json['isLiked'] as bool? ?? false,
      isReel: json['isReel'] as bool? ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
      authorId: (user?['id'] as String?) ?? '',
      authorName: (user?['name'] as String?) ?? 'مستخدم',
      authorUsername: user?['username'] as String?,
      authorAvatarUrl: user?['avatarUrl'] as String?,
    );
  }
}

// POST /videos/:id/reactions and GET /videos/:id/reactions's shared shape --
// { counts, total, userReaction } (VideosService.getReactions/react),
// structurally identical to posts' ReactionSummary but kept separate since
// videos have no per-reactor `reactions` list (no reactors breakdown UI
// exists on web's video player either -- ReactionPicker.tsx there only ever
// reads counts/userReaction).
class VideoReactions {
  final Map<String, int> counts;
  final int total;
  final String? userReaction;

  const VideoReactions({this.counts = const {}, this.total = 0, this.userReaction});

  factory VideoReactions.fromJson(Map<String, dynamic> json) {
    final countsJson = json['counts'] as Map<String, dynamic>? ?? const {};
    return VideoReactions(
      counts: countsJson.map((k, v) => MapEntry(k, v as int)),
      total: json['total'] as int? ?? 0,
      userReaction: json['userReaction'] as String?,
    );
  }
}
