import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';
import '../../domain/entities/post.dart';
import '../providers/posts_providers.dart';
import '../screens/create_post_screen.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../saved/presentation/providers/saved_providers.dart';

// Mirrors web's per-post PostMenu (web/src/features/posts/components/
// PostCard.tsx) -- Save/Share/Edit/Archive/Delete for the author's own post,
// Save/Share/"not interested"/snooze for anyone else's, rendered from both
// the feed list and the post-detail screen (same as web renders the same
// PostCard component in both spots). Extracted into one shared widget so
// this logic -- and the save-endpoint disambiguation below -- lives in
// exactly one place instead of being copy-pasted between feed_screen.dart
// and post_detail_screen.dart.
class PostMenuButton extends ConsumerWidget {
  final Post post;
  final bool isOwn;

  /// Called after a successful delete -- REQUIRED because delete already has
  /// an established, working call site in each screen (FeedNotifier.delete()
  /// does an optimistic-remove-then-rollback-on-failure dance; the detail
  /// screen deletes then pops) that this widget must not duplicate or race.
  final Future<void> Function() onDelete;

  /// Called after a successful archive/unarchive toggle. Optional -- archive
  /// and hide below run their own network call inside this widget (no
  /// pre-existing optimistic logic to preserve, unlike delete), so the
  /// callback here is just "now update your own local list/UI".
  final VoidCallback? onArchived;

  /// Called after a successful hide ("not interested") or snooze.
  final VoidCallback? onHidden;

  /// Called with the freshly-edited Post after a successful edit.
  final ValueChanged<Post>? onEdited;

  const PostMenuButton({
    super.key,
    required this.post,
    required this.isOwn,
    required this.onDelete,
    this.onArchived,
    this.onHidden,
    this.onEdited,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return PopupMenuButton<String>(
      onSelected: (value) => _handle(context, ref, value),
      itemBuilder: (context) => [
        if (isOwn)
          const PopupMenuItem(
            value: 'edit',
            child: ListTile(leading: Icon(Icons.edit_outlined), title: Text('تعديل'), contentPadding: EdgeInsets.zero),
          ),
        const PopupMenuItem(
          value: 'save',
          child: ListTile(leading: Icon(Icons.bookmark_border), title: Text('حفظ'), contentPadding: EdgeInsets.zero),
        ),
        const PopupMenuItem(
          value: 'share',
          child: ListTile(leading: Icon(Icons.share_outlined), title: Text('مشاركة'), contentPadding: EdgeInsets.zero),
        ),
        if (isOwn)
          PopupMenuItem(
            value: 'archive',
            child: ListTile(
              leading: const Icon(Icons.archive_outlined),
              title: Text(post.isArchived ? 'إلغاء الأرشفة' : 'أرشفة'),
              contentPadding: EdgeInsets.zero,
            ),
          ),
        if (!isOwn)
          const PopupMenuItem(
            value: 'hide',
            child: ListTile(leading: Icon(Icons.visibility_off_outlined), title: Text('غير مهتم'), contentPadding: EdgeInsets.zero),
          ),
        if (!isOwn)
          const PopupMenuItem(
            value: 'snooze',
            child: ListTile(leading: Icon(Icons.snooze_outlined), title: Text('إخفاء لمدة 30 يوماً'), contentPadding: EdgeInsets.zero),
          ),
        if (isOwn)
          const PopupMenuItem(
            value: 'delete',
            child: ListTile(
              leading: Icon(Icons.delete_outline, color: AppTheme.dangerColor),
              title: Text('حذف', style: TextStyle(color: AppTheme.dangerColor)),
              contentPadding: EdgeInsets.zero,
            ),
          ),
      ],
    );
  }

  Future<void> _handle(BuildContext context, WidgetRef ref, String value) async {
    switch (value) {
      case 'edit':
        await _edit(context);
        break;
      case 'save':
        await _save(context, ref);
        break;
      case 'share':
        await _share(context);
        break;
      case 'archive':
        await _archive(context, ref);
        break;
      case 'hide':
        await _hide(context, ref, 'not_interested');
        break;
      case 'snooze':
        await _hide(context, ref, 'snooze', snoozeDays: 30);
        break;
      case 'delete':
        await onDelete();
        break;
    }
  }

  Future<void> _edit(BuildContext context) async {
    final updated = await Navigator.of(context).push<Post>(
      MaterialPageRoute(builder: (_) => CreatePostScreen(editingPost: post)),
    );
    if (updated != null) onEdited?.call(updated);
  }

  // Save menu item (Phase 23) -- deliberately reuses the `saved` feature's
  // SaveItemUseCase (Phase 14, POST /saved with { entityType: 'post',
  // entityId }) rather than PostsRepository.savePost() (legacy POST
  // /posts/:id/save). Both endpoints exist and both work, but curl-verifying
  // web/src/features/posts/hooks.ts's useSavePost (what the actual PostCard
  // menu calls) confirmed it goes through savedPostsApi.saveItem -> POST
  // /saved, not postsApi.savePost -- matching that, not the legacy route, so
  // saved posts actually show up on the Saved/Collections screen (Phase 14),
  // which reads from the /saved module, not from GET /posts/saved.
  Future<void> _save(BuildContext context, WidgetRef ref) async {
    final messenger = ScaffoldMessenger.of(context);
    try {
      await ref.read(saveItemUseCaseProvider).call('post', post.id);
      messenger.showSnackBar(const SnackBar(content: Text('تم حفظ المنشور')));
    } catch (e) {
      final alreadySaved = e is DioException &&
          e.response?.data is Map &&
          (e.response?.data as Map)['message'] == 'Already saved';
      messenger.showSnackBar(
        SnackBar(content: Text(alreadySaved ? 'تم حفظ هذا المنشور من قبل' : 'تعذّر حفظ المنشور')),
      );
    }
  }

  // Native OS share sheet (share_plus) -- web's own Share button opens an
  // in-app modal (repost-to-feed or send-to-a-friend-in-chat), not a
  // mobile-style OS share sheet, so there's no single web action to mirror
  // 1:1 here. Shares the post's content plus a permalink built the same way
  // web's own SendToFriendPicker builds one (`${origin}/posts/${postId}`,
  // see PostCard.tsx) -- reusing AppConstants.apiBaseUrl (which already
  // points at the right host per environment/build) rather than a
  // hardcoded domain, so it stays correct across dev/device/prod builds.
  Future<void> _share(BuildContext context) async {
    final origin = AppConstants.apiBaseUrl.replaceFirst(RegExp(r'/api/v1/?$'), '');
    final url = '$origin/posts/${post.id}';
    final text = post.content.trim().isNotEmpty ? '${post.content.trim()}\n\n$url' : url;
    await Share.share(text);
  }

  Future<void> _archive(BuildContext context, WidgetRef ref) async {
    final messenger = ScaffoldMessenger.of(context);
    final wasArchived = post.isArchived;
    try {
      await ref.read(archivePostUseCaseProvider)(post.id);
      messenger.showSnackBar(
        SnackBar(content: Text(wasArchived ? 'تم إلغاء الأرشفة' : 'تم أرشفة المنشور')),
      );
      onArchived?.call();
    } catch (e) {
      messenger.showSnackBar(const SnackBar(content: Text('تعذّر تنفيذ العملية')));
    }
  }

  Future<void> _hide(BuildContext context, WidgetRef ref, String hideType, {int? snoozeDays}) async {
    final messenger = ScaffoldMessenger.of(context);
    try {
      await ref.read(hidePostUseCaseProvider)(post.id, hideType: hideType, snoozeDays: snoozeDays);
      messenger.showSnackBar(
        SnackBar(content: Text(hideType == 'snooze' ? 'تم إخفاء المنشور مؤقتاً' : 'لن نعرض منشورات مشابهة')),
      );
      onHidden?.call();
    } catch (e) {
      messenger.showSnackBar(const SnackBar(content: Text('تعذّر إخفاء المنشور')));
    }
  }
}
