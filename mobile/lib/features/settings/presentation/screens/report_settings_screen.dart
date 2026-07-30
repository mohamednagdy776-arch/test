import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/constants/theme.dart';
import '../providers/settings_providers.dart';

const _issueTypes = [
  ('bug', 'خطأ تقني', Icons.bug_report_outlined),
  ('feature', 'اقتراح ميزة', Icons.lightbulb_outline),
  ('account', 'مشكلة في الحساب', Icons.person_outline),
  ('privacy', 'مشكلة في الخصوصية', Icons.lock_outline),
  ('other', 'أخرى', Icons.more_horiz),
];

// Mirrors web's settings/report/page.tsx (POST /support/report -- a general
// "report a problem to support" form, distinct from reporting a specific
// user/post which lives elsewhere in the app). Attachments are images only
// via image_picker (capped at 3, matching web) -- no file_picker package in
// this project to also offer video/PDF like web does.
class ReportSettingsScreen extends ConsumerStatefulWidget {
  const ReportSettingsScreen({super.key});

  @override
  ConsumerState<ReportSettingsScreen> createState() => _ReportSettingsScreenState();
}

class _ReportSettingsScreenState extends ConsumerState<ReportSettingsScreen> {
  String? _issueType;
  final _descriptionCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final List<XFile> _attachments = [];
  bool _sending = false;
  bool _submitted = false;

  @override
  void dispose() {
    _descriptionCtrl.dispose();
    _emailCtrl.dispose();
    super.dispose();
  }

  Future<void> _addAttachments() async {
    final picked = await ImagePicker().pickMultiImage(imageQuality: 85);
    if (picked.isEmpty) return;
    setState(() {
      _attachments.addAll(picked);
      if (_attachments.length > 3) _attachments.removeRange(3, _attachments.length);
    });
  }

  Future<void> _submit() async {
    if (_issueType == null || _descriptionCtrl.text.trim().isEmpty) return;
    setState(() => _sending = true);
    try {
      await ref.read(reportUseCaseProvider).submit(
            type: _issueType!,
            description: _descriptionCtrl.text.trim(),
            email: _emailCtrl.text.trim().isEmpty ? null : _emailCtrl.text.trim(),
            attachmentPaths: _attachments.map((f) => f.path).toList(),
          );
      if (mounted) setState(() => _submitted = true);
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('فشل إرسال البلاغ. يرجى المحاولة مجدداً.')),
      );
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  void _resetForm() {
    setState(() {
      _submitted = false;
      _issueType = null;
      _descriptionCtrl.clear();
      _emailCtrl.clear();
      _attachments.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_submitted) {
      return Scaffold(
        appBar: AppBar(title: const Text('الإبلاغ عن مشكلة')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.check_circle, color: AppTheme.successColor, size: 56),
                const SizedBox(height: 12),
                const Text('تم إرسال البلاغ بنجاح', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                const SizedBox(height: 4),
                const Text('شكراً لك، سنراجع البلاغ ونعود إليك قريباً', textAlign: TextAlign.center),
                const SizedBox(height: 20),
                ElevatedButton(onPressed: _resetForm, child: const Text('إرسال بلاغ جديد')),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('الإبلاغ عن مشكلة')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('نوع المشكلة', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _issueTypes.map((t) {
              final selected = _issueType == t.$1;
              return ChoiceChip(
                selected: selected,
                label: Text(t.$2),
                avatar: Icon(t.$3, size: 18),
                onSelected: (_) => setState(() => _issueType = t.$1),
              );
            }).toList(),
          ),
          const SizedBox(height: 20),
          const Text('التفاصيل', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 8),
          TextField(
            controller: _emailCtrl,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(labelText: 'البريد الإلكتروني (اختياري)'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _descriptionCtrl,
            maxLines: 6,
            onChanged: (_) => setState(() {}),
            decoration: const InputDecoration(labelText: 'وصف المشكلة', alignLabelWithHint: true),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: _attachments.length >= 3 ? null : _addAttachments,
            icon: const Icon(Icons.attach_file),
            label: const Text('إضافة لقطة شاشة (حتى 3)'),
          ),
          if (_attachments.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Column(
                children: _attachments
                    .map((f) => ListTile(
                          dense: true,
                          contentPadding: EdgeInsets.zero,
                          title: Text(f.name, overflow: TextOverflow.ellipsis),
                          trailing: IconButton(
                            icon: const Icon(Icons.close, size: 18),
                            onPressed: () => setState(() => _attachments.remove(f)),
                          ),
                        ))
                    .toList(),
              ),
            ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: (_issueType == null || _descriptionCtrl.text.trim().isEmpty || _sending) ? null : _submit,
            child: _sending
                ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : const Text('إرسال البلاغ'),
          ),
        ],
      ),
    );
  }
}
