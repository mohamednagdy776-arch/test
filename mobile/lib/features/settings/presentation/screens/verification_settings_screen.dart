import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/constants/theme.dart';
import '../providers/settings_providers.dart';
import '../../domain/entities/verification_status.dart';

const _statusUi = {
  'approved': ('موثّقة', AppTheme.successColor, 'تم التحقق من هويتك. تظهر شارة "موثّق الهوية" على ملفك.'),
  'pending': ('قيد المراجعة', AppTheme.accentColor, 'طلبك قيد المراجعة من فريقنا. سنخطرك بالنتيجة قريباً.'),
  'rejected': ('مرفوضة', AppTheme.dangerColor, 'لم يُقبل الطلب. يمكنك إعادة الإرسال بصور أوضح.'),
};

// Mirrors web's settings/verification/page.tsx: selfie + government-ID
// upload for identity (KYC) verification. Skips the admin-only pending/
// approve/reject endpoints (moderation queue, not a user-facing settings
// screen -- out of scope per phase brief).
class VerificationSettingsScreen extends ConsumerStatefulWidget {
  const VerificationSettingsScreen({super.key});

  @override
  ConsumerState<VerificationSettingsScreen> createState() => _VerificationSettingsScreenState();
}

class _VerificationSettingsScreenState extends ConsumerState<VerificationSettingsScreen> {
  bool _loading = true;
  bool _submitting = false;
  IdentityVerificationStatus? _status;
  XFile? _selfie;
  XFile? _idDocument;
  String? _error;

  @override
  void initState() {
    super.initState();
    Future.microtask(_load);
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final status = await ref.read(verificationUseCaseProvider).getStatus();
      if (mounted) setState(() => _status = status);
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذّر تحميل حالة التوثيق');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _pick(bool selfie) async {
    final picked = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (picked == null) return;
    setState(() {
      if (selfie) {
        _selfie = picked;
      } else {
        _idDocument = picked;
      }
    });
  }

  Future<void> _submit() async {
    if (_selfie == null || _idDocument == null) return;
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      await ref.read(verificationUseCaseProvider).submit(selfiePath: _selfie!.path, idDocumentPath: _idDocument!.path);
      if (!mounted) return;
      setState(() {
        _selfie = null;
        _idDocument = null;
      });
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم استلام طلب التوثيق')));
      await _load();
    } catch (_) {
      if (!mounted) return;
      setState(() => _error = 'تعذّر إرسال الطلب');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final status = _status;
    final ui = status != null ? _statusUi[status.status] : null;
    final canSubmit = status?.canSubmit ?? true;

    return Scaffold(
      appBar: AppBar(title: const Text('توثيق الهوية')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                const Text(
                  'وثّق هويتك بصورة شخصية وصورة لإثبات هوية رسمي لتحصل على شارة "موثّق الهوية" وتزيد ثقة الآخرين بك.',
                  style: TextStyle(fontSize: 13, color: AppTheme.textSecondary),
                ),
                const SizedBox(height: 16),
                if (ui != null)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text.rich(TextSpan(children: [
                            const TextSpan(text: 'الحالة: '),
                            TextSpan(text: ui.$1, style: TextStyle(color: ui.$2, fontWeight: FontWeight.bold)),
                          ])),
                          const SizedBox(height: 4),
                          Text(ui.$3, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                          if (status?.status == 'rejected' && status?.rejectionReason != null) ...[
                            const SizedBox(height: 8),
                            Text('السبب: ${status!.rejectionReason}', style: const TextStyle(fontSize: 12, color: AppTheme.dangerColor)),
                          ],
                        ],
                      ),
                    ),
                  ),
                if (_error != null)
                  Container(
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(top: 12),
                    decoration: BoxDecoration(color: AppTheme.dangerColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                    child: Text(_error!, style: const TextStyle(color: AppTheme.dangerColor)),
                  ),
                if (canSubmit) ...[
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(child: _FilePickTile(label: 'صورة شخصية (سيلفي)', file: _selfie, onTap: () => _pick(true))),
                      const SizedBox(width: 12),
                      Expanded(child: _FilePickTile(label: 'إثبات هوية رسمي', file: _idDocument, onTap: () => _pick(false))),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: (_selfie == null || _idDocument == null || _submitting) ? null : _submit,
                    child: _submitting
                        ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Text('إرسال للتوثيق'),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'تُستخدم مستنداتك للتحقق فقط، ولا تظهر للمستخدمين الآخرين.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                  ),
                ],
              ],
            ),
    );
  }
}

class _FilePickTile extends StatelessWidget {
  final String label;
  final XFile? file;
  final VoidCallback onTap;
  const _FilePickTile({required this.label, required this.file, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(color: AppTheme.textSecondary.withValues(alpha: 0.4), style: BorderStyle.solid),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(file != null ? Icons.check_circle : Icons.add_a_photo_outlined, color: file != null ? AppTheme.successColor : AppTheme.textSecondary),
            const SizedBox(height: 8),
            Text(label, textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
            const SizedBox(height: 4),
            Text(
              file != null ? file!.name : 'اضغط للاختيار',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
