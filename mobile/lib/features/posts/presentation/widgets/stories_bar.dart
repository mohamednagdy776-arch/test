import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/story.dart';
import '../providers/posts_providers.dart';
import '../screens/create_story_screen.dart';
import '../screens/story_viewer_screen.dart';
import '../screens/archive_screen.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/media.dart';

// Horizontal avatar-ring strip above the feed, matching web's StoriesBar
// (web/src/features/posts/components/PostFeed.tsx): a leading "add story"
// button, then one ring per author group (own story first if present --
// the backend already orders getAllStories() by most-recent createdAt, and
// the signed-in user's own story is always included regardless of follows).
class StoriesBar extends ConsumerStatefulWidget {
  const StoriesBar({super.key});

  @override
  ConsumerState<StoriesBar> createState() => _StoriesBarState();
}

class _StoriesBarState extends ConsumerState<StoriesBar> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(storiesProvider.notifier).loadInitial());
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(storiesProvider);

    return Stack(
      children: [
        Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: AppTheme.surfaceColor,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE7DFC9)),
          ),
          child: SizedBox(
            height: 92,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              children: [
                _AddStoryButton(onTap: () async {
                  final created = await Navigator.of(context).push<bool>(
                    MaterialPageRoute(
                        builder: (_) => const CreateStoryScreen()),
                  );
                  if (created == true) {
                    ref.read(storiesProvider.notifier).refresh();
                  }
                }),
                const SizedBox(width: 8),
                if (state.isLoading && state.groups.isEmpty)
                  const Center(
                      child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: 24),
                    child: SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2)),
                  )),
                for (var i = 0; i < state.groups.length; i++) ...[
                  _StoryRing(
                    group: state.groups[i],
                    onTap: () async {
                      await Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => StoryViewerScreen(
                            groups: state.groups,
                            initialGroupIndex: i,
                          ),
                        ),
                      );
                      ref.read(storiesProvider.notifier).refresh();
                    },
                  ),
                  const SizedBox(width: 8),
                ],
              ],
            ),
          ),
        ),
        Positioned(
          top: 2,
          left: 4,
          child: IconButton(
            icon: const Icon(Icons.archive_outlined,
                size: 18, color: AppTheme.textSecondary),
            tooltip: 'الأرشيف',
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const ArchiveScreen()),
            ),
          ),
        ),
      ],
    );
  }
}

class _AddStoryButton extends StatelessWidget {
  final VoidCallback onTap;
  const _AddStoryButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 64,
        child: Column(
          children: [
            Container(
              height: 60,
              width: 60,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.backgroundColor,
              ),
              child: Stack(
                children: [
                  const Center(
                      child: Icon(Icons.photo_camera_outlined, size: 26)),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      height: 18,
                      width: 18,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppTheme.primaryColor,
                        border:
                            Border.all(color: AppTheme.surfaceColor, width: 2),
                      ),
                      child:
                          const Icon(Icons.add, size: 12, color: Colors.white),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 4),
            const Text('إضافة قصة',
                style: TextStyle(fontSize: 10),
                maxLines: 1,
                overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }
}

class _StoryRing extends StatelessWidget {
  final StoryGroup group;
  final VoidCallback onTap;
  const _StoryRing({required this.group, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final avatarUrl = resolveMediaUrl(group.authorAvatarUrl);
    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 64,
        child: Column(
          children: [
            Container(
              height: 60,
              width: 60,
              padding: const EdgeInsets.all(2.5),
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [
                    AppTheme.primaryColor,
                    AppTheme.secondaryColor,
                    AppTheme.accentColor
                  ],
                ),
              ),
              child: Container(
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppTheme.surfaceColor,
                ),
                child: CircleAvatar(
                  backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
                  backgroundImage:
                      avatarUrl != null ? NetworkImage(avatarUrl) : null,
                  child: avatarUrl == null
                      ? Text(group.authorName.isNotEmpty
                          ? group.authorName[0]
                          : '?')
                      : null,
                ),
              ),
            ),
            const SizedBox(height: 4),
            Text(group.authorName,
                style: const TextStyle(fontSize: 10),
                maxLines: 1,
                overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }
}
