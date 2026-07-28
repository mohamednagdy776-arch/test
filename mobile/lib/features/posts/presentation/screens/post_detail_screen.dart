import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/comment.dart';
import '../../domain/entities/post.dart';
import '../providers/posts_providers.dart';
import '../widgets/reaction_picker.dart';
import '../widgets/comment_tile.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/extensions.dart';
import '../../../../core/utils/media.dart';
import '../../../../features/profile/presentation/providers/profile_providers.dart';

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
      appBar: AppBar(title: const Text('المنشور')),
      body: state.isLoading && state.post == null
          ? const Center(child: CircularProgressIndicator())
          : state.post == null
              ? Center(child: Text(state.error ?? 'تعذّر تحميل المنشور'))
              : RefreshIndicator(
                  onRefresh: notifier.refresh,
                  child: ListView(
                    padding: const EdgeInsets.all(12),
                    children: [
                      _PostBody(post: state.post!),
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
  const _PostBody({required this.post});

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
            Row(
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
