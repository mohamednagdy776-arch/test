import 'package:flutter/material.dart';
import '../../domain/entities/saved_item.dart';
import '../../../posts/presentation/screens/post_detail_screen.dart';
import '../../../posts/presentation/screens/story_viewer_screen.dart';
import '../../../posts/domain/entities/story.dart';
import '../../../videos/presentation/screens/video_detail_screen.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/media.dart';

// Renders one row of GET /saved (or a collection's items) -- the entity
// shape differs per entityType (post/video/story), mirroring web's
// saved/page.tsx which branches the same way. A saved `comment` or an
// entity whose source row was deleted server-side (entity == null) has
// nothing to render, so it falls back to a plain "removed" placeholder
// instead of crashing on a null field.
class SavedItemTile extends StatelessWidget {
  final SavedItem item;
  final VoidCallback onRemove;

  const SavedItemTile({super.key, required this.item, required this.onRemove});

  String _formatDate(DateTime date) => date.toLocal().toString().split(' ').first;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        onTap: () => _open(context),
        leading: _leading(),
        title: Text(_title(), maxLines: 2, overflow: TextOverflow.ellipsis),
        subtitle: Text('تم الحفظ في ${_formatDate(item.savedAt)}'),
        trailing: IconButton(
          icon: const Icon(Icons.delete_outline, color: AppTheme.dangerColor),
          onPressed: onRemove,
        ),
      ),
    );
  }

  Widget _leading() {
    String? url;
    IconData fallback = Icons.bookmark_outline;
    if (item.entityType == 'post') {
      url = resolveMediaUrl(item.post?.mediaUrl);
      fallback = Icons.article_outlined;
    } else if (item.entityType == 'video') {
      url = resolveMediaUrl(item.video?.thumbnailUrl);
      fallback = Icons.play_circle_outline;
    } else if (item.entityType == 'story') {
      url = resolveMediaUrl(item.story?.thumbnailUrl ?? item.story?.mediaUrl);
      fallback = Icons.photo_camera_outlined;
    }
    if (url != null) {
      return CircleAvatar(backgroundImage: NetworkImage(url));
    }
    return CircleAvatar(child: Icon(fallback));
  }

  String _title() {
    switch (item.entityType) {
      case 'post':
        return item.post?.content.isNotEmpty == true ? item.post!.content : 'منشور';
      case 'video':
        return item.video?.title.isNotEmpty == true ? item.video!.title : 'فيديو';
      case 'story':
        return item.story?.text?.isNotEmpty == true ? item.story!.text! : 'قصة';
      default:
        return 'عنصر محذوف';
    }
  }

  void _open(BuildContext context) {
    if (item.entityType == 'post' && item.post != null) {
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => PostDetailScreen(postId: item.post!.id)),
      );
    } else if (item.entityType == 'video' && item.video != null) {
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => VideoDetailScreen(videoId: item.video!.id)),
      );
    } else if (item.entityType == 'story' && item.story != null) {
      final story = item.story!;
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => StoryViewerScreen(
            groups: [
              StoryGroup(
                userId: story.userId,
                authorName: story.authorName,
                authorUsername: story.authorUsername,
                authorAvatarUrl: story.authorAvatarUrl,
                stories: [story],
              ),
            ],
            initialGroupIndex: 0,
          ),
        ),
      );
    }
  }
}
