import 'package:flutter/material.dart';
import '../../domain/entities/video.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/media.dart';
import '../../../../core/utils/extensions.dart';

// Grid tile for the Watch feed, mirroring web's VideoCard
// (web/src/app/(main)/watch/page.tsx): thumbnail with a duration badge and
// play glyph, uploader avatar + name, view count + relative time.
class VideoCard extends StatelessWidget {
  final Video video;
  final VoidCallback onTap;
  const VideoCard({super.key, required this.video, required this.onTap});

  String _formatViews(int count) {
    if (count >= 1000000) return '${(count / 1000000).toStringAsFixed(1)}م';
    if (count >= 1000) return '${(count / 1000).toStringAsFixed(1)}ألف';
    return '$count';
  }

  String _formatDuration(int? seconds) {
    if (seconds == null) return '0:00';
    final mins = seconds ~/ 60;
    final secs = seconds % 60;
    return '$mins:${secs.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final thumbnailUrl = resolveMediaUrl(video.thumbnailUrl);
    final avatarUrl = resolveMediaUrl(video.authorAvatarUrl);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.surfaceColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE7DFC9)),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AspectRatio(
              aspectRatio: 16 / 9,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  thumbnailUrl != null
                      ? Image.network(thumbnailUrl, fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => const _PlaceholderThumb())
                      : const _PlaceholderThumb(),
                  Positioned(
                    bottom: 6,
                    right: 6,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.72),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(_formatDuration(video.duration),
                          style: const TextStyle(color: Colors.white, fontSize: 11)),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CircleAvatar(
                    radius: 14,
                    backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
                    backgroundImage: avatarUrl != null ? NetworkImage(avatarUrl) : null,
                    child: avatarUrl == null
                        ? Text(video.authorName.isNotEmpty ? video.authorName[0] : '?', style: const TextStyle(fontSize: 12))
                        : null,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(video.title,
                            maxLines: 2, overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                        const SizedBox(height: 2),
                        Text(video.authorName,
                            style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                        Text('${_formatViews(video.viewCount)} مشاهدة · ${video.createdAt.timeAgo}',
                            style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PlaceholderThumb extends StatelessWidget {
  const _PlaceholderThumb();

  @override
  Widget build(BuildContext context) {
    return const ColoredBox(
      color: AppTheme.backgroundColor,
      child: Center(child: Icon(Icons.play_circle_outline, size: 36, color: AppTheme.textSecondary)),
    );
  }
}
