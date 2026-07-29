import '../../../posts/domain/entities/post.dart';
import '../../../posts/domain/entities/story.dart';
import '../../../videos/domain/entities/video.dart';

// GET /saved's live shape (curl-verified against backend/src/memories/
// services/saved.service.ts's hydrateEntities): a flat list, each row
// { id, entityType, entityId, collectionId, savedAt, collection, entity }.
// `entity` is null when the underlying post/video/story was deleted, or
// always null for entityType == 'comment' (never hydrated server-side).
class SavedItem {
  final String id;
  final String entityType; // 'post' | 'comment' | 'video' | 'story'
  final String entityId;
  final String? collectionId;
  final DateTime savedAt;
  final Post? post;
  final Video? video;
  final Story? story;

  const SavedItem({
    required this.id,
    required this.entityType,
    required this.entityId,
    this.collectionId,
    required this.savedAt,
    this.post,
    this.video,
    this.story,
  });

  factory SavedItem.fromJson(Map<String, dynamic> json) {
    final entityType = json['entityType'] as String? ?? '';
    final entity = json['entity'] as Map<String, dynamic>?;
    return SavedItem(
      id: json['id'] as String,
      entityType: entityType,
      entityId: json['entityId'] as String? ?? '',
      collectionId: json['collectionId'] as String?,
      savedAt: DateTime.parse(json['savedAt'] as String),
      post: entityType == 'post' && entity != null ? Post.fromJson(entity) : null,
      video: entityType == 'video' && entity != null ? Video.fromJson(entity) : null,
      story: entityType == 'story' && entity != null ? Story.fromJson(entity) : null,
    );
  }
}
