// GET /users/:id/photos returns raw ActivityLog rows (type='photo'), NOT a
// dedicated Photo entity -- the actual media URL lives in one of several
// possible `metadata` keys depending on which flow logged the activity
// (avatar upload vs cover upload vs post-photo vs legacy rows with no media
// reference at all). Mirrors web's [username]/page.tsx PhotosTab fallback
// chain exactly (metadata.url ?? .coverUrl ?? .avatarUrl ?? .mediaUrl),
// including its "skip rows with none of these" behavior (#90/#91 fixes).
class ProfilePhotoItem {
  final String id;
  final String imageUrl;

  const ProfilePhotoItem({required this.id, required this.imageUrl});

  /// Returns null when the row has no resolvable media (skip it), matching
  /// web's `if (!photoUrl) return null`.
  static ProfilePhotoItem? fromJson(Map<String, dynamic> json) {
    final metadata = json['metadata'] as Map<String, dynamic>?;
    final url = metadata?['url'] as String? ??
        metadata?['coverUrl'] as String? ??
        metadata?['avatarUrl'] as String? ??
        metadata?['mediaUrl'] as String?;
    if (url == null || url.isEmpty) return null;
    return ProfilePhotoItem(id: json['id'] as String? ?? url, imageUrl: url);
  }
}

// GET /users/:id/videos returns raw Video entity rows (backend/src/videos/
// entities/video.entity.ts) -- a DIFFERENT, unformatted shape from the main
// GET /videos feed that features/videos/domain/entities/video.dart's Video
// models (that one is run through VideosService.format() and flattens an
// author `user` object; this raw query never loads/serializes `createdBy`
// at all). Field names also differ: `url`/`thumbnail`/`views`, not
// `videoUrl`/`thumbnailUrl`/`viewCount`.
class ProfileVideoItem {
  final String id;
  final String title;
  final String? url;
  final String? thumbnailUrl;

  const ProfileVideoItem({required this.id, required this.title, this.url, this.thumbnailUrl});

  factory ProfileVideoItem.fromJson(Map<String, dynamic> json) => ProfileVideoItem(
        id: json['id'] as String,
        title: json['title'] as String? ?? '',
        url: json['url'] as String?,
        thumbnailUrl: json['thumbnail'] as String?,
      );
}
