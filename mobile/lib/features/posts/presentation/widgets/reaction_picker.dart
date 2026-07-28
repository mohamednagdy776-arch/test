import 'package:flutter/material.dart';
import '../../../../core/constants/theme.dart';

class ReactionType {
  final String type;
  final String emoji;
  final String label;
  const ReactionType(this.type, this.emoji, this.label);
}

// Mirrors web/src/features/reactions/ReactionPicker.tsx's REACTIONS list --
// 6 user-selectable types. `support` is accepted by the backend
// (CreateReactionDto/CommentReactionType enum, confirmed via curl) purely
// for backward-compatibility with rows stored before the type set expanded;
// the web picker never offers it either, so it's intentionally left out
// here too.
const kReactionTypes = [
  ReactionType('like', '👍', 'إعجاب'),
  ReactionType('love', '❤️', 'حب'),
  ReactionType('haha', '😂', 'ضحك'),
  ReactionType('wow', '😮', 'مثير'),
  ReactionType('sad', '😢', 'حزن'),
  ReactionType('angry', '😠', 'غضب'),
];

ReactionType? reactionTypeFor(String? type) {
  if (type == null) return null;
  for (final r in kReactionTypes) {
    if (r.type == type) return r;
  }
  return null;
}

// Bottom-sheet picker (simpler and more mobile-idiomatic than web's
// hover-anchored popover, which depends on mouse events that don't exist on
// touch). `onSelect` is invoked with the tapped type; the backend toggles
// off if it's the viewer's current reaction, same as a plain re-tap.
Future<void> showReactionPicker(BuildContext context,
    {required ValueChanged<String> onSelect}) {
  return showModalBottomSheet(
    context: context,
    builder: (context) {
      return SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Wrap(
            alignment: WrapAlignment.center,
            children: kReactionTypes.map((r) {
              return InkWell(
                borderRadius: BorderRadius.circular(28),
                onTap: () {
                  Navigator.of(context).pop();
                  onSelect(r.type);
                },
                child: Padding(
                  padding: const EdgeInsets.all(8),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(r.emoji, style: const TextStyle(fontSize: 28)),
                      const SizedBox(height: 2),
                      Text(r.label, style: const TextStyle(fontSize: 11)),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      );
    },
  );
}

// Compact "top reactions" summary (up to 3 highest-count types) -- mirrors
// PostCard's inline breakdown pill on web. The full per-reactor breakdown
// modal (GET .../breakdown) is deliberately not built: it's a strict subset
// of the data GET .../reactions already returns (see ReactionSummary's doc
// comment), and isn't essential to the core comment/reaction flow this
// phase targets.
class ReactionCountsRow extends StatelessWidget {
  final Map<String, int> counts;
  final int total;
  const ReactionCountsRow(
      {super.key, required this.counts, required this.total});

  @override
  Widget build(BuildContext context) {
    if (total == 0) return const SizedBox.shrink();
    final sorted = counts.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (final e in sorted.take(3))
          Padding(
            padding: const EdgeInsetsDirectional.only(end: 6),
            child: Text('${reactionTypeFor(e.key)?.emoji ?? '👍'} ${e.value}',
                style: const TextStyle(fontSize: 12)),
          ),
      ],
    );
  }
}

// The reaction trigger itself: shows the viewer's current reaction (or the
// neutral "إعجاب" default), a tap toggles it (re-tapping the same type
// un-reacts, matching the backend's toggle semantics), and a long-press
// opens the full picker to choose a specific type.
class ReactionButton extends StatelessWidget {
  final String? myReaction;
  final Map<String, int> counts;
  final int total;
  final ValueChanged<String> onSelect;

  const ReactionButton({
    super.key,
    required this.myReaction,
    required this.counts,
    required this.total,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    final current = reactionTypeFor(myReaction);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: () => onSelect(myReaction ?? 'like'),
          onLongPress: () => showReactionPicker(context, onSelect: onSelect),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(current?.emoji ?? '👍',
                    style: const TextStyle(fontSize: 16)),
                const SizedBox(width: 6),
                Text(
                  current?.label ?? 'إعجاب',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: current != null
                        ? AppTheme.primaryColor
                        : AppTheme.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 8),
        ReactionCountsRow(counts: counts, total: total),
      ],
    );
  }
}
