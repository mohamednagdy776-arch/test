import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/videos_providers.dart';

// Mirrors web's video-report UI: both ReportReelModal
// (web/src/app/(main)/reels/page.tsx) and the inline report Modal in
// web/src/app/(main)/watch/[id]/page.tsx hardcode the same 5 reasons (a
// subset of the full GET /reports/reasons catalog -- that catalog also has
// fake_profile/underage/impersonation, which only make sense for reporting
// a *user*, not a video) and both POST /reports with entityType: 'video'.
// Reused as-is for both the Reels dots-menu and the Watch detail screen so
// this list and the submit flow live in exactly one place.
const _reportReasons = [
  ('inappropriate', 'محتوى غير لائق'),
  ('harassment', 'تحرّش أو إساءة'),
  ('scam', 'احتيال أو معلومات مضللة'),
  ('off_platform', 'محتوى مزعج / غير مرغوب'),
  ('other', 'سبب آخر'),
];

Future<void> showReportVideoDialog(BuildContext context, String videoId) {
  return showDialog<void>(
    context: context,
    builder: (dialogContext) => _ReportVideoDialog(videoId: videoId),
  );
}

class _ReportVideoDialog extends ConsumerStatefulWidget {
  final String videoId;
  const _ReportVideoDialog({required this.videoId});

  @override
  ConsumerState<_ReportVideoDialog> createState() => _ReportVideoDialogState();
}

class _ReportVideoDialogState extends ConsumerState<_ReportVideoDialog> {
  String? _reason;
  final _detailsCtrl = TextEditingController();
  bool _submitting = false;

  @override
  void dispose() {
    _detailsCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_reason == null || _submitting) return;
    final messenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);
    setState(() => _submitting = true);
    try {
      await ref.read(reportVideoUseCaseProvider).call(
            widget.videoId,
            _reason!,
            details: _detailsCtrl.text.trim().isEmpty ? null : _detailsCtrl.text.trim(),
          );
      navigator.pop();
      messenger.showSnackBar(const SnackBar(content: Text('تم استلام بلاغك، وسيقوم فريقنا بمراجعته')));
    } catch (_) {
      if (mounted) setState(() => _submitting = false);
      messenger.showSnackBar(const SnackBar(content: Text('تعذّر إرسال البلاغ، حاول مجدداً')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('الإبلاغ عن الفيديو'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('حدد سبب الإبلاغ:'),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _reportReasons.map((r) {
                return ChoiceChip(
                  selected: _reason == r.$1,
                  label: Text(r.$2),
                  onSelected: (_) => setState(() => _reason = r.$1),
                );
              }).toList(),
            ),
            if (_reason == 'other') ...[
              const SizedBox(height: 12),
              TextField(
                controller: _detailsCtrl,
                maxLines: 3,
                maxLength: 500,
                decoration: const InputDecoration(hintText: 'اكتب التفاصيل هنا (اختياري)'),
              ),
            ],
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: _submitting ? null : () => Navigator.of(context).pop(),
          child: const Text('إلغاء'),
        ),
        FilledButton(
          onPressed: _reason == null || _submitting ? null : _submit,
          child: _submitting
              ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
              : const Text('إرسال البلاغ'),
        ),
      ],
    );
  }
}
