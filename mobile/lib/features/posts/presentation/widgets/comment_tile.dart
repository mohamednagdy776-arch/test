import 'package:flutter/material.dart';
import '../../domain/entities/comment.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/extensions.dart';
import '../../../../core/utils/media.dart';
import 'reaction_picker.dart';

// Renders one root comment plus its direct replies. The backend caps
// nesting at exactly one level (CommentsService.create: "Replies cannot
// exceed one level of nesting", confirmed live -- replying to a reply is
// rejected), so `onReply` is only offered on root comments (isReply==false)
// and replies render themselves recursively with onReply: null rather than
// needing a separate depth-tracking parameter.
class CommentTile extends StatelessWidget {
  final Comment comment;
  final String? myUserId;
  final bool isPostOwner;
  final bool isReply;
  final ValueChanged<Comment>? onReply;
  final void Function(Comment comment, String newContent) onEdit;
  final ValueChanged<Comment> onDelete;
  final void Function(Comment comment, String type) onReact;

  const CommentTile({
    super.key,
    required this.comment,
    required this.myUserId,
    required this.isPostOwner,
    this.isReply = false,
    this.onReply,
    required this.onEdit,
    required this.onDelete,
    required this.onReact,
  });

  // Comment authors can edit/delete their own comment; the post owner can
  // additionally delete (but not edit) anyone's comment on their own post --
  // matches CommentsService.delete's isCommentAuthor || isPostOwner check.
  bool get _canDelete =>
      myUserId != null && (comment.authorId == myUserId || isPostOwner);
  bool get _canEdit => myUserId != null && comment.authorId == myUserId;

  @override
  Widget build(BuildContext context) {
    final avatarUrl = resolveMediaUrl(comment.authorAvatarUrl);
    final myReaction = comment.myReactionType(myUserId);
    final counts = comment.reactionCounts;
    final total = comment.reactions.length;

    return Padding(
      padding: EdgeInsetsDirectional.only(start: isReply ? 36 : 0, bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: isReply ? 14 : 16,
            backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
            backgroundImage: avatarUrl != null ? NetworkImage(avatarUrl) : null,
            child: avatarUrl == null
                ? Text(
                    comment.authorName.isNotEmpty ? comment.authorName[0] : '؟')
                : null,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppTheme.surfaceColor,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFE7DFC9)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              comment.authorName,
                              style: const TextStyle(
                                  fontWeight: FontWeight.w700, fontSize: 12),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(comment.createdAt.timeAgo,
                              style: const TextStyle(
                                  fontSize: 10, color: AppTheme.textSecondary)),
                          if (comment.editedAt != null) ...[
                            const SizedBox(width: 4),
                            const Text('(معدّل)',
                                style: TextStyle(
                                    fontSize: 10,
                                    color: AppTheme.textSecondary)),
                          ],
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(comment.content,
                          style: const TextStyle(fontSize: 13)),
                    ],
                  ),
                ),
                const SizedBox(height: 2),
                Row(
                  children: [
                    ReactionButton(
                      myReaction: myReaction,
                      counts: counts,
                      total: total,
                      onSelect: (type) => onReact(comment, type),
                    ),
                    if (onReply != null)
                      TextButton(
                        onPressed: () => onReply!(comment),
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 6),
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        child: const Text('رد', style: TextStyle(fontSize: 12)),
                      ),
                    if (_canDelete || _canEdit)
                      PopupMenuButton<String>(
                        iconSize: 16,
                        onSelected: (v) {
                          if (v == 'delete') onDelete(comment);
                          if (v == 'edit') _showEditDialog(context);
                        },
                        itemBuilder: (context) => [
                          if (_canEdit)
                            const PopupMenuItem(
                                value: 'edit', child: Text('تعديل')),
                          if (_canDelete)
                            const PopupMenuItem(
                                value: 'delete', child: Text('حذف')),
                        ],
                      ),
                  ],
                ),
                for (final reply in comment.replies)
                  CommentTile(
                    comment: reply,
                    myUserId: myUserId,
                    isPostOwner: isPostOwner,
                    isReply: true,
                    onEdit: onEdit,
                    onDelete: onDelete,
                    onReact: onReact,
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showEditDialog(BuildContext context) {
    final controller = TextEditingController(text: comment.content);
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('تعديل التعليق'),
        content:
            TextField(controller: controller, maxLines: 4, autofocus: true),
        actions: [
          TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: const Text('إلغاء')),
          FilledButton(
            onPressed: () {
              Navigator.of(dialogContext).pop();
              onEdit(comment, controller.text);
            },
            child: const Text('حفظ'),
          ),
        ],
      ),
    );
  }
}
