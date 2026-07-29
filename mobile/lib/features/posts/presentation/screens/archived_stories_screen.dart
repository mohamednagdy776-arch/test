import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/story.dart';
import '../providers/posts_providers.dart';
import 'story_viewer_screen.dart';
import '../../../../core/utils/media.dart';

// GET /stories/archived's own-archived-only listing, matching web's
// /archive page (stories tab) -- kept as a lightweight standalone screen
// here rather than a combined posts+stories archive hub, since post
// archiving is a separate pre-existing feature outside this phase's scope.
// A simple local StatefulWidget (no dedicated notifier) is enough for a
// one-off list-then-unarchive flow like this.
class ArchivedStoriesScreen extends ConsumerStatefulWidget {
  const ArchivedStoriesScreen({super.key});

  @override
  ConsumerState<ArchivedStoriesScreen> createState() =>
      _ArchivedStoriesScreenState();
}

class _ArchivedStoriesScreenState extends ConsumerState<ArchivedStoriesScreen> {
  bool _loading = true;
  String? _error;
  List<Story> _stories = const [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final page = await ref.read(getArchivedStoriesUseCaseProvider)();
      if (!mounted) return;
      setState(() {
        _stories = page.items;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'تعذّر تحميل الأرشيف';
        _loading = false;
      });
    }
  }

  Future<void> _unarchive(Story story) async {
    try {
      await ref.read(archiveStoryUseCaseProvider)(story.id);
      if (!mounted) return;
      setState(
          () => _stories = _stories.where((s) => s.id != story.id).toList());
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('تعذّر إلغاء الأرشفة')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('القصص المؤرشفة')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : _stories.isEmpty
                  ? const Center(child: Text('لا توجد قصص مؤرشفة'))
                  : ListView.builder(
                      padding: const EdgeInsets.all(12),
                      itemCount: _stories.length,
                      itemBuilder: (context, i) {
                        final story = _stories[i];
                        final mediaUrl = resolveMediaUrl(
                            story.mediaUrl ?? story.thumbnailUrl);
                        return Card(
                          child: ListTile(
                            leading: mediaUrl != null
                                ? CircleAvatar(
                                    backgroundImage: NetworkImage(mediaUrl))
                                : const CircleAvatar(
                                    child: Icon(Icons.photo_camera_outlined)),
                            title: Text(story.text?.isNotEmpty == true
                                ? story.text!
                                : 'قصة'),
                            subtitle: Text(story.createdAt
                                .toLocal()
                                .toString()
                                .split(' ')
                                .first),
                            onTap: () => Navigator.of(context).push(
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
                            ),
                            trailing: TextButton(
                              onPressed: () => _unarchive(story),
                              child: const Text('إلغاء الأرشفة'),
                            ),
                          ),
                        );
                      },
                    ),
    );
  }
}
