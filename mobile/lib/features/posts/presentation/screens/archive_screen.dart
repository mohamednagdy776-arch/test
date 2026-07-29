import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/post.dart';
import '../../domain/entities/story.dart';
import '../providers/posts_providers.dart';
import 'post_detail_screen.dart';
import 'story_viewer_screen.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/extensions.dart';
import '../../../../core/utils/media.dart';

// Combined archive hub matching web/src/app/(main)/archive/page.tsx --
// archived posts + archived stories in one screen with tabs. Supersedes the
// standalone ArchivedStoriesScreen built in Phase 13 (which deliberately
// scoped out posts: "post archiving is a separate pre-existing feature
// outside this phase's scope"); that scope gap is what this phase fills.
class ArchiveScreen extends ConsumerStatefulWidget {
  const ArchiveScreen({super.key});

  @override
  ConsumerState<ArchiveScreen> createState() => _ArchiveScreenState();
}

class _ArchiveScreenState extends ConsumerState<ArchiveScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  bool _postsLoading = true;
  String? _postsError;
  List<Post> _posts = const [];

  bool _storiesLoading = true;
  String? _storiesError;
  List<Story> _stories = const [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadPosts();
    _loadStories();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadPosts() async {
    setState(() {
      _postsLoading = true;
      _postsError = null;
    });
    try {
      final page = await ref.read(getArchivedPostsUseCaseProvider)();
      if (!mounted) return;
      setState(() {
        _posts = page.items;
        _postsLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _postsError = 'تعذّر تحميل المنشورات المؤرشفة';
        _postsLoading = false;
      });
    }
  }

  Future<void> _loadStories() async {
    setState(() {
      _storiesLoading = true;
      _storiesError = null;
    });
    try {
      final page = await ref.read(getArchivedStoriesUseCaseProvider)();
      if (!mounted) return;
      setState(() {
        _stories = page.items;
        _storiesLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _storiesError = 'تعذّر تحميل القصص المؤرشفة';
        _storiesLoading = false;
      });
    }
  }

  Future<void> _unarchivePost(Post post) async {
    try {
      await ref.read(archivePostUseCaseProvider)(post.id);
      if (!mounted) return;
      setState(() => _posts = _posts.where((p) => p.id != post.id).toList());
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تعذّر إلغاء الأرشفة')));
    }
  }

  Future<void> _unarchiveStory(Story story) async {
    try {
      await ref.read(archiveStoryUseCaseProvider)(story.id);
      if (!mounted) return;
      setState(() => _stories = _stories.where((s) => s.id != story.id).toList());
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تعذّر إلغاء الأرشفة')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('الأرشيف'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [Tab(text: 'المنشورات'), Tab(text: 'القصص')],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildPostsTab(),
          _buildStoriesTab(),
        ],
      ),
    );
  }

  Widget _buildPostsTab() {
    if (_postsLoading) return const Center(child: CircularProgressIndicator());
    if (_postsError != null) return Center(child: Text(_postsError!));
    if (_posts.isEmpty) return const Center(child: Text('لا توجد منشورات مؤرشفة'));
    return RefreshIndicator(
      onRefresh: _loadPosts,
      child: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: _posts.length,
        itemBuilder: (context, i) {
          final post = _posts[i];
          final mediaUrl = resolveMediaUrl(post.mediaUrl);
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  InkWell(
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => PostDetailScreen(postId: post.id)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(post.authorName, style: const TextStyle(fontWeight: FontWeight.w600)),
                        if (post.content.isNotEmpty) ...[
                          const SizedBox(height: 6),
                          Text(post.content, maxLines: 3, overflow: TextOverflow.ellipsis),
                        ],
                        if (mediaUrl != null) ...[
                          const SizedBox(height: 8),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.network(mediaUrl, fit: BoxFit.cover, width: double.infinity, height: 140),
                          ),
                        ],
                        const SizedBox(height: 6),
                        Text(post.createdAt.timeAgo, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                      ],
                    ),
                  ),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: TextButton(
                      onPressed: () => _unarchivePost(post),
                      child: const Text('إلغاء الأرشفة'),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildStoriesTab() {
    if (_storiesLoading) return const Center(child: CircularProgressIndicator());
    if (_storiesError != null) return Center(child: Text(_storiesError!));
    if (_stories.isEmpty) return const Center(child: Text('لا توجد قصص مؤرشفة'));
    return RefreshIndicator(
      onRefresh: _loadStories,
      child: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: _stories.length,
        itemBuilder: (context, i) {
          final story = _stories[i];
          final mediaUrl = resolveMediaUrl(story.mediaUrl ?? story.thumbnailUrl);
          return Card(
            child: ListTile(
              leading: mediaUrl != null
                  ? CircleAvatar(backgroundImage: NetworkImage(mediaUrl))
                  : const CircleAvatar(child: Icon(Icons.photo_camera_outlined)),
              title: Text(story.text?.isNotEmpty == true ? story.text! : 'قصة'),
              subtitle: Text(story.createdAt.timeAgo),
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
                onPressed: () => _unarchiveStory(story),
                child: const Text('إلغاء الأرشفة'),
              ),
            ),
          );
        },
      ),
    );
  }
}
