import 'package:flutter/material.dart';
import '../../../../core/constants/theme.dart';

// Same 6 quick-reactions as web/ChatWindow.tsx's EMOJI_REACTIONS.
const kChatReactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

// Long-press menu for a message bubble (Phase 22): reactions + reply always
// offered; delete options only for the caller's own, non-tombstoned messages
// (mirrors web hiding its hover action buttons once `isDeletedForEveryone`).
// A bottom sheet (not a hover popover) since there's no mouse-hover concept
// on touch -- same call already made for post reactions
// (posts/presentation/widgets/reaction_picker.dart's showReactionPicker).
Future<void> showMessageActionSheet(
  BuildContext context, {
  required ValueChanged<String> onReact,
  required VoidCallback onReply,
  VoidCallback? onDeleteForMe,
  VoidCallback? onDeleteForEveryone,
}) {
  return showModalBottomSheet(
    context: context,
    builder: (sheetContext) {
      return SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 10),
              child: Wrap(
                alignment: WrapAlignment.center,
                children: kChatReactionEmojis.map((emoji) {
                  return InkWell(
                    borderRadius: BorderRadius.circular(24),
                    onTap: () {
                      Navigator.of(sheetContext).pop();
                      onReact(emoji);
                    },
                    child: Padding(
                      padding: const EdgeInsets.all(10),
                      child: Text(emoji, style: const TextStyle(fontSize: 26)),
                    ),
                  );
                }).toList(),
              ),
            ),
            const Divider(height: 1),
            ListTile(
              leading: const Icon(Icons.reply),
              title: const Text('رد'),
              onTap: () {
                Navigator.of(sheetContext).pop();
                onReply();
              },
            ),
            if (onDeleteForMe != null)
              ListTile(
                leading: const Icon(Icons.delete_outline, color: AppTheme.dangerColor),
                title: const Text('حذف لي فقط', style: TextStyle(color: AppTheme.dangerColor)),
                onTap: () {
                  Navigator.of(sheetContext).pop();
                  onDeleteForMe();
                },
              ),
            if (onDeleteForEveryone != null)
              ListTile(
                leading: const Icon(Icons.delete_forever, color: AppTheme.dangerColor),
                title: const Text('حذف للجميع', style: TextStyle(color: AppTheme.dangerColor)),
                onTap: () {
                  Navigator.of(sheetContext).pop();
                  onDeleteForEveryone();
                },
              ),
          ],
        ),
      );
    },
  );
}
