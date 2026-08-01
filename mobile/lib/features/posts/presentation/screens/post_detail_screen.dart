import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/comment.dart';
import '../../domain/entities/poll_option.dart';
import '../../domain/entities/poll_voter.dart';
import '../../domain/entities/post.dart';
import '../providers/posts_providers.dart';
import '../widgets/reaction_picker.dart';
import '../widgets/comment_tile.dart';
import '../widgets/post_menu_button.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/extensions.dart';
import '../../../../core/utils/media.dart';
import '../../../../features/profile/presentation/providers/profile_providers.dart';
import '../../../../features/profile/presentation/screens/public_profile_screen.dart';

// Mirrors web/src/app/(main)/posts/[id]/page.tsx (single post + comment
// thread + reaction picker), rendered as PostCard there. Pushed directly
// with an already-known postId -- no GoRoute -- same convention
// group_detail_screen.dart uses for a comparable "detail screen with nested
// list + composer" (see app_router.dart's comment on match/chat/group
// detail not being registered routes).
class PostDetailScreen extends ConsumerStatefulWidget {
  final String postId;
  const PostDetailScreen({super.key, required this.postId});

  @override
  ConsumerState<PostDetailScreen> createState() => _PostDetailScreenState();
}

class _PostDetailScreenState extends ConsumerState<PostDetailScreen> {
  final _composerController = TextEditingController();
  Comment? _replyTo;

  @override
  void initState() {
    super.initState();
    Future.microtask(
        () => ref.read(postDetailProvider(widget.postId).notifier).load());
  }

  @override
  void dispose() {
    _composerController.dispose();
    super.dispose();
  }

  void _submitComment() {
    final text = _composerController.text;
    if (text.trim().isEmpty) return;
    ref
        .read(postDetailProvider(widget.postId).notifier)
        .addComment(text, parentId: _replyTo?.id);
    _composerController.clear();
    setState(() => _replyTo = null);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(postDetailProvider(widget.postId));
    final notifier = ref.read(postDetailProvider(widget.postId).notifier);
    final myProfile = ref.watch(myProfileProvider).valueOrNull;
    final myUserId = myProfile?.userId;
    final isPostOwner = myUserId != null && state.post?.userId == myUserId;

    return Scaffold(
      appBar: AppBar(
        title: const Text('المنشور'),
        actions: state.post == null
            ? null
            : [
                PostMenuButton(
                  post: state.post!,
                  isOwn: isPostOwner,
                  onDelete: () async {
                    await ref.read(deletePostUseCaseProvider)(state.post!.id);
                    if (context.mounted) Navigator.of(context).pop();
                  },
                  onArchived: notifier.refresh,
                  onHidden: () {
                    if (context.mounted) Navigator.of(context).pop();
                  },
                  onEdited: notifier.setPost,
                ),
              ],
      ),
      body: state.isLoading && state.post == null
          ? const Center(child: CircularProgressIndicator())
          : state.post == null
              ? Center(child: Text(state.error ?? 'تعذّر تحميل المنشور'))
              : RefreshIndicator(
                  onRefresh: notifier.refresh,
                  child: ListView(
                    padding: const EdgeInsets.all(12),
                    children: [
                      _PostBody(
                        post: state.post!,
                        myUserId: myUserId,
                        isOwner: isPostOwner,
                        onVote: notifier.votePoll,
                      ),
                      const SizedBox(height: 10),
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 6),
                        child: ReactionButton(
                          myReaction: state.reactions.userReaction,
                          counts: state.reactions.counts,
                          total: state.reactions.total,
                          onSelect: notifier.toggleReaction,
                        ),
                      ),
                      const Divider(height: 24),
                      Text('التعليقات (${state.comments.length})',
                          style: const TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 15)),
                      const SizedBox(height: 10),
                      if (state.error != null)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Text(state.error!,
                              style: const TextStyle(
                                  color: AppTheme.dangerColor, fontSize: 12)),
                        ),
                      if (state.comments.isEmpty)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 16),
                          child: Center(
                            child: Text('لا توجد تعليقات بعد',
                                style:
                                    TextStyle(color: AppTheme.textSecondary)),
                          ),
                        )
                      else
                        ...state.comments.map((c) => CommentTile(
                              comment: c,
                              myUserId: myUserId,
                              isPostOwner: isPostOwner,
                              onReply: (target) =>
                                  setState(() => _replyTo = target),
                              onEdit: (target, content) =>
                                  notifier.editComment(target.id, content),
                              onDelete: (target) =>
                                  notifier.deleteComment(target.id),
                              onReact: (target, type) =>
                                  notifier.reactToComment(target.id, type),
                            )),
                      const SizedBox(height: 80),
                    ],
                  ),
                ),
      bottomNavigationBar: state.post == null
          ? null
          : SafeArea(
              child: _Composer(
                controller: _composerController,
                isSubmitting: state.isSubmittingComment,
                replyTo: _replyTo,
                onCancelReply: () => setState(() => _replyTo = null),
                onSubmit: _submitComment,
              ),
            ),
    );
  }
}

class _PostBody extends StatelessWidget {
  final Post post;
  final String? myUserId;
  final bool isOwner;
  final ValueChanged<int> onVote;

  const _PostBody({
    required this.post,
    required this.myUserId,
    required this.isOwner,
    required this.onVote,
  });

  @override
  Widget build(BuildContext context) {
    final avatarUrl = resolveMediaUrl(post.authorAvatarUrl);
    final mediaUrl = resolveMediaUrl(post.mediaUrl);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            InkWell(
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
                    backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
                    backgroundImage:
                        avatarUrl != null ? NetworkImage(avatarUrl) : null,
                    child: avatarUrl == null
                        ? Text(
                            post.authorName.isNotEmpty ? post.authorName[0] : '؟')
                        : null,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(post.authorName,
                            style: const TextStyle(fontWeight: FontWeight.w600)),
                        Text(post.createdAt.timeAgo,
                            style: const TextStyle(
                                fontSize: 12, color: AppTheme.textSecondary)),
                      ],
                    ),
                  ),
                ],
              ),
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
            if (post.pollOptions != null) ...[
              const SizedBox(height: 10),
              _PollView(post: post, myUserId: myUserId, isOwner: isOwner, onVote: onVote),
            ],
          ],
        ),
      ),
    );
  }
}

// Poll voting + owner-only voter breakdown -- mirrors web's PollDisplay +
// PollVotersModal (web/src/features/posts/components/PostCard.tsx). Tapping
// an un-voted option votes/re-votes (backend allows changing an existing
// vote to a different option); the already-picked option is disabled.
class _PollView extends StatelessWidget {
  final Post post;
  final String? myUserId;
  final bool isOwner;
  final ValueChanged<int> onVote;

  const _PollView({
    required this.post,
    required this.myUserId,
    required this.isOwner,
    required this.onVote,
  });

  @override
  Widget build(BuildContext context) {
    final options = post.pollOptions!;
    final totalVotes = options.fold<int>(0, (sum, o) => sum + o.votes);

    // GET /posts/:id skips sanitizePolls() for the post's own author
    // (curl-verified live -- see poll_option.dart's PollOption doc comment),
    // so the owner's initial load never gets a top-level `myVote` at all,
    // only raw per-option `voterIds`. Fall back to scanning those for the
    // owner's own id so the "already voted" state is still correct on first
    // load, not just after this session's own vote action refreshes
    // `myVote` directly from the vote response.
    int? myVote = post.myVote;
    if (myVote == null && isOwner && myUserId != null) {
      final idx = options.indexWhere((o) => o.voterIds?.contains(myUserId) ?? false);
      if (idx >= 0) myVote = idx;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (var i = 0; i < options.length; i++) ...[
          _PollOptionBar(
            option: options[i],
            percentage: totalVotes > 0 ? ((options[i].votes / totalVotes) * 100).round() : 0,
            voted: myVote == i,
            onTap: myVote == i ? null : () => onVote(i),
          ),
          const SizedBox(height: 6),
        ],
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('$totalVotes صوت', style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
            if (isOwner && totalVotes > 0) ...[
              const SizedBox(width: 8),
              GestureDetector(
                onTap: () => showDialog(context: context, builder: (_) => _PollVotersDialog(postId: post.id)),
                child: const Text('عرض المصوّتين',
                    style: TextStyle(fontSize: 12, color: AppTheme.primaryColor, fontWeight: FontWeight.w600)),
              ),
            ],
          ],
        ),
      ],
    );
  }
}

class _PollOptionBar extends StatelessWidget {
  final PollOption option;
  final int percentage;
  final bool voted;
  final VoidCallback? onTap;

  const _PollOptionBar({
    required this.option,
    required this.percentage,
    required this.voted,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: voted ? AppTheme.primaryColor : const Color(0xFFE7DFC9)),
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          children: [
            FractionallySizedBox(
              widthFactor: percentage / 100,
              child: Container(
                height: 40,
                color: voted
                    ? AppTheme.primaryColor.withValues(alpha: 0.18)
                    : AppTheme.textSecondary.withValues(alpha: 0.08),
              ),
            ),
            Container(
              height: 40,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              alignment: Alignment.centerRight,
              child: Row(
                children: [
                  Expanded(child: Text(option.text)),
                  Text('$percentage% (${option.votes})',
                      style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PollVotersDialog extends ConsumerWidget {
  final String postId;
  const _PollVotersDialog({required this.postId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return AlertDialog(
      title: const Text('من صوّت؟'),
      content: SizedBox(
        width: double.maxFinite,
        child: FutureBuilder<List<PollVoterOption>>(
          future: ref.read(getPollVotersUseCaseProvider)(postId),
          builder: (context, snapshot) {
            if (snapshot.connectionState != ConnectionState.done) {
              return const Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: Center(child: CircularProgressIndicator()),
              );
            }
            if (snapshot.hasError) {
              return const Padding(
                padding: EdgeInsets.symmetric(vertical: 12),
                child: Text('تعذّر تحميل قائمة المصوّتين'),
              );
            }
            final options = snapshot.data ?? const [];
            return SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  for (final opt in options) ...[
                    Text('${opt.text} (${opt.votes})',
                        style: const TextStyle(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    if (opt.voters.isEmpty)
                      const Padding(
                        padding: EdgeInsets.only(bottom: 10),
                        child: Text('لا يوجد مصوّتون', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                      )
                    else
                      ...opt.voters.map((v) => Padding(
                            padding: const EdgeInsets.symmetric(vertical: 3),
                            child: Row(
                              children: [
                                CircleAvatar(
                                  radius: 12,
                                  backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
                                  backgroundImage:
                                      resolveMediaUrl(v.avatarUrl) != null ? NetworkImage(resolveMediaUrl(v.avatarUrl)!) : null,
                                  child: resolveMediaUrl(v.avatarUrl) == null
                                      ? Text(v.name.isNotEmpty ? v.name[0] : '؟', style: const TextStyle(fontSize: 10))
                                      : null,
                                ),
                                const SizedBox(width: 8),
                                Text(v.name),
                              ],
                            ),
                          )),
                    const SizedBox(height: 8),
                  ],
                ],
              ),
            );
          },
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('إغلاق')),
      ],
    );
  }
}

class _Composer extends StatelessWidget {
  final TextEditingController controller;
  final bool isSubmitting;
  final Comment? replyTo;
  final VoidCallback onCancelReply;
  final VoidCallback onSubmit;

  const _Composer({
    required this.controller,
    required this.isSubmitting,
    required this.replyTo,
    required this.onCancelReply,
    required this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
      decoration: const BoxDecoration(
        color: AppTheme.surfaceColor,
        border: Border(top: BorderSide(color: Color(0xFFE7DFC9))),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (replyTo != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                children: [
                  Expanded(
                    child: Text('الرد على ${replyTo!.authorName}',
                        style: const TextStyle(
                            fontSize: 12, color: AppTheme.textSecondary),
                        overflow: TextOverflow.ellipsis),
                  ),
                  InkWell(
                      onTap: onCancelReply,
                      child: const Icon(Icons.close, size: 16)),
                ],
              ),
            ),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: controller,
                  minLines: 1,
                  maxLines: 4,
                  decoration:
                      const InputDecoration(hintText: 'اكتب تعليقاً...'),
                ),
              ),
              const SizedBox(width: 8),
              isSubmitting
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2))
                  : IconButton(
                      icon: const Icon(Icons.send), onPressed: onSubmit),
            ],
          ),
        ],
      ),
    );
  }
}
