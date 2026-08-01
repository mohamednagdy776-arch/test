import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/theme.dart';
import '../providers/chat_providers.dart';

// Per-message "عرض الأصل" / "عرض الترجمة" toggle (Phase 22, item 6). Mirrors
// web's TranslatedMessageBody + useTranslatedText: shows the original by
// default, translates only on request (#305 parity -- auto-translating by
// default was the wrong default and got reversed there too), and falls back
// to silently showing the original if translation isn't possible.
class TranslatableMessageBody extends ConsumerStatefulWidget {
  final String content;
  final bool isOwn;
  const TranslatableMessageBody({super.key, required this.content, required this.isOwn});

  @override
  ConsumerState<TranslatableMessageBody> createState() => _TranslatableMessageBodyState();
}

class _TranslatableMessageBodyState extends ConsumerState<TranslatableMessageBody> {
  // Keyed by the message content itself (messages are immutable once sent),
  // so scrolling a bubble out of and back into the ListView's viewport --
  // which recreates this widget via ListView.builder -- doesn't re-hit the
  // network for a translation already fetched this session.
  static final Map<String, String> _cache = {};

  bool _fetched = false;
  bool _loading = false;
  String? _translated;
  bool _showOriginal = true;

  Future<void> _onTogglePressed() async {
    if (!_fetched) {
      final cached = _cache[widget.content];
      if (cached != null) {
        setState(() {
          _fetched = true;
          _translated = cached;
          _showOriginal = false;
        });
        return;
      }
      setState(() => _loading = true);
      final result = await ref.read(chatTranslationClientProvider).translate(widget.content);
      if (!mounted) return;
      if (result != null) _cache[widget.content] = result;
      setState(() {
        _loading = false;
        _fetched = true;
        _translated = result;
        _showOriginal = result == null;
      });
      return;
    }
    setState(() => _showOriginal = !_showOriginal);
  }

  @override
  Widget build(BuildContext context) {
    final hasTranslation = _translated != null;
    final displayText = hasTranslation && !_showOriginal ? _translated! : widget.content;
    final textColor = widget.isOwn ? Colors.white : AppTheme.foregroundColor;
    final subColor = widget.isOwn ? Colors.white70 : AppTheme.textSecondary;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(displayText, style: TextStyle(color: textColor)),
        if (_loading)
          Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  width: 10,
                  height: 10,
                  child: CircularProgressIndicator(strokeWidth: 1.5, color: subColor),
                ),
                const SizedBox(width: 6),
                Text('جارٍ الترجمة...', style: TextStyle(fontSize: 10, color: subColor)),
              ],
            ),
          )
        else if (!_fetched || hasTranslation)
          Padding(
            padding: const EdgeInsets.only(top: 4),
            child: InkWell(
              onTap: _onTogglePressed,
              child: Text(
                !_fetched
                    ? 'عرض الترجمة 🌐'
                    : (_showOriginal ? 'عرض الترجمة 🌐' : 'مترجم · عرض الأصل 🌐'),
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: subColor),
              ),
            ),
          ),
      ],
    );
  }
}
