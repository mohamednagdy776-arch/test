import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../domain/entities/post.dart';
import '../providers/posts_providers.dart';
import 'create_post_screen.dart';
import 'post_detail_screen.dart';
import '../widgets/stories_bar.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/constants/routes.dart';
import '../../../../core/utils/extensions.dart';
import '../../../../core/utils/media.dart';
import '../../../../features/auth/presentation/providers/auth_providers.dart';
import '../../../../features/profile/presentation/providers/profile_providers.dart';
import '../../../../features/notifications/presentation/providers/notifications_providers.dart';
import '../../../../features/profile/presentation/screens/public_profile_screen.dart';

class FeedScreen extends ConsumerStatefulWidget {
  const FeedScreen({super.key});

  @override
  ConsumerState<FeedScreen> createState() => _FeedScreenState();
}

class _FeedScreenState extends ConsumerState<FeedScreen> {
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    Future.microtask(() => ref.read(feedProvider.notifier).loadInitial());
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 300) {
      ref.read(feedProvider.notifier).loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    final feed = ref.watch(feedProvider);
    final myProfile = ref.watch(myProfileProvider).valueOrNull;
    final unreadCount = ref.watch(unreadCountProvider).valueOrNull ?? 0;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tayyibt'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => context.push(AppRoutes.search),
          ),
          IconButton(
            icon: const Icon(Icons.people_outline),
            onPressed: () => context.push(AppRoutes.friends),
          ),
          IconButton(
            icon: const Icon(Icons.groups_outlined),
            onPressed: () => context.push(AppRoutes.groups),
          ),
          IconButton(
            icon: const Icon(Icons.smart_display_outlined),
            tooltip: 'المشاهدة',
            onPressed: () => context.push(AppRoutes.watch),
          ),
          IconButton(
            icon: const Icon(Icons.play_circle_outline),
            tooltip: 'ريلز',
            onPressed: () => context.push(AppRoutes.reels),
          ),
          IconButton(
            icon: const Icon(Icons.favorite_border),
            onPressed: () => context.push(AppRoutes.matching),
          ),
          IconButton(
            icon: const Icon(Icons.chat_bubble_outline),
            onPressed: () => context.push(AppRoutes.chat),
          ),
          IconButton(
            icon: Badge(
              isLabelVisible: unreadCount > 0,
              label: Text('$unreadCount'),
              child: const Icon(Icons.notifications_outlined),
            ),
            onPressed: () async {
              await context.push(AppRoutes.notifications);
              ref.invalidate(unreadCountProvider);
            },
          ),
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () => context.push(AppRoutes.profile),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await ref.read(authRepositoryProvider).logout();
              if (context.mounted) context.go(AppRoutes.login);
            },
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final created = await Navigator.of(context).push<Post>(
            MaterialPageRoute(builder: (_) => const CreatePostScreen()),
          );
          if (created != null) ref.read(feedProvider.notifier).prepend(created);
        },
        child: const Icon(Icons.add),
      ),
      body: _buildBody(feed, myProfile?.userId),
    );
  }

  Widget _buildBody(feed, String? myUserId) {
    if (feed.isLoading && feed.items.isEmpty) {
      return const Column(children: [
        Padding(padding: EdgeInsets.all(12), child: StoriesBar()),
        Expanded(child: Center(child: CircularProgressIndicator())),
      ]);
    }
    if (feed.error != null && feed.items.isEmpty) {
      return Column(children: [
        const Padding(padding: EdgeInsets.all(12), child: StoriesBar()),
        Expanded(child: Center(child: Text(feed.error!))),
      ]);
    }
    if (feed.items.isEmpty) {
      return const Column(children: [
        Padding(padding: EdgeInsets.all(12), child: StoriesBar()),
        Expanded(child: Center(child: Text('لا توجد منشورات بعد'))),
      ]);
    }

    return RefreshIndicator(
      onRefresh: () => ref.read(feedProvider.notifier).refresh(),
      child: ListView.builder(
        controller: _scrollController,
        padding: const EdgeInsets.all(12),
        // +1 for the leading StoriesBar header item, on top of the feed items
        // and the trailing loader.
        itemCount: (1 + feed.items.length + (feed.hasMore ? 1 : 0)) as int,
        itemBuilder: (context, index) {
          if (index == 0) return const StoriesBar();
          final itemIndex = index - 1;
          if (itemIndex >= feed.items.length) {
            return const Padding(
              padding: EdgeInsets.symmetric(vertical: 16),
              child: Center(child: CircularProgressIndicator()),
            );
          }
          final post = feed.items[itemIndex];
          return _PostCard(
            post: post,
            isOwn: post.userId == myUserId,
            onDelete: () => ref.read(feedProvider.notifier).delete(post.id),
          );
        },
      ),
    );
  }
}

class _PostCard extends StatelessWidget {
  final Post post;
  final bool isOwn;
  final VoidCallback onDelete;

  const _PostCard(
      {required this.post, required this.isOwn, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    final avatarUrl = resolveMediaUrl(post.authorAvatarUrl);
    final mediaUrl = resolveMediaUrl(post.mediaUrl);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => PostDetailScreen(postId: post.id)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  // Its own tap target (opens the author's profile), nested
                  // inside the card's outer InkWell (opens the post) -- the
                  // inner GestureDetector wins the tap for this region.
                  GestureDetector(
                    onTap: () => Navigator.of(context).push(MaterialPageRoute(
                      builder: (_) => PublicProfileScreen(
                        userId: post.userId,
                        initialName: post.authorName,
                        initialAvatarUrl: post.authorAvatarUrl,
                      ),
                    )),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 18,
                          backgroundColor:
                              AppTheme.primaryColor.withValues(alpha: 0.1),
                          backgroundImage:
                              avatarUrl != null ? NetworkImage(avatarUrl) : null,
                          child: avatarUrl == null
                              ? Text(post.authorName.isNotEmpty
                                  ? post.authorName[0]
                                  : '?')
                              : null,
                        ),
                        const SizedBox(width: 10),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(post.authorName,
                                style: const TextStyle(fontWeight: FontWeight.w600)),
                            Text(post.createdAt.timeAgo,
                                style: const TextStyle(
                                    fontSize: 12, color: AppTheme.textSecondary)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),
                  if (isOwn)
                    PopupMenuButton<String>(
                      onSelected: (v) {
                        if (v == 'delete') onDelete();
                      },
                      itemBuilder: (context) => const [
                        PopupMenuItem(value: 'delete', child: Text('حذف')),
                      ],
                    ),
                ],
              ),
              if (post.content.isNotEmpty) ...[
                const SizedBox(height: 10),
                Text(post.content),
              ],
              if (mediaUrl != null) ...[
                const SizedBox(height: 10),
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(mediaUrl,
                      fit: BoxFit.cover, width: double.infinity),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
