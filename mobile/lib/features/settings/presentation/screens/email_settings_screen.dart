import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/theme.dart';
import '../providers/settings_providers.dart';

// Mirrors web's settings/email/page.tsx: a 3-step "request a change" form
// (POST /auth/change-email -> emails a confirmation link -> user follows it,
// which mobile doesn't need to handle itself since that flow completes in
// the browser/mail client).
class EmailSettingsScreen extends ConsumerStatefulWidget {
  const EmailSettingsScreen({super.key});

  @override
  ConsumerState<EmailSettingsScreen> createState() => _EmailSettingsScreenState();
}

class _EmailSettingsScreenState extends ConsumerState<EmailSettingsScreen> {
  final _newEmailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _loading = false;
  String? _error;
  String? _done;
  String? _currentEmail;

  @override
  void initState() {
    super.initState();
    Future.microtask(() async {
      try {
        final email = await ref.read(emailUseCaseProvider).getCurrentEmail();
        if (mounted) setState(() => _currentEmail = email);
      } catch (_) {
        // Non-critical -- the form still works without showing the current email.
      }
    });
  }

  @override
  void dispose() {
    _newEmailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _newEmailCtrl.text.trim();
    if (!RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(email)) {
      setState(() => _error = 'صيغة البريد الإلكتروني غير صحيحة');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
      _done = null;
    });
    try {
      await ref.read(emailUseCaseProvider).requestEmailChange(email, _passwordCtrl.text);
      if (!mounted) return;
      setState(() {
        _done = 'تم إرسال رابط تأكيد إلى بريدك الجديد';
        _newEmailCtrl.clear();
        _passwordCtrl.clear();
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = 'فشل تغيير البريد الإلكتروني، تحقق من كلمة المرور');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('البريد الإلكتروني')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Card(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('١. أدخل بريدك الإلكتروني الجديد وكلمة مرورك الحالية'),
                    SizedBox(height: 4),
                    Text('٢. سنرسل رابط تأكيد إلى البريد الجديد'),
                    SizedBox(height: 4),
                    Text('٣. افتح الرابط لإتمام تغيير بريدك'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            if (_currentEmail != null && _currentEmail!.isNotEmpty)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(color: AppTheme.primaryColor.withValues(alpha: 0.06), borderRadius: BorderRadius.circular(8)),
                child: Text.rich(TextSpan(children: [
                  const TextSpan(text: 'البريد الحالي: ', style: TextStyle(fontWeight: FontWeight.bold)),
                  TextSpan(text: _currentEmail),
                ])),
              ),
            if (_done != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(color: AppTheme.successColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                child: Text(_done!, style: const TextStyle(color: AppTheme.successColor)),
              ),
            if (_error != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(color: AppTheme.dangerColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                child: Text(_error!, style: const TextStyle(color: AppTheme.dangerColor)),
              ),
            TextField(
              controller: _newEmailCtrl,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(labelText: 'البريد الإلكتروني الجديد'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _passwordCtrl,
              obscureText: true,
              decoration: const InputDecoration(labelText: 'كلمة المرور الحالية'),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: (_loading || _newEmailCtrl.text.isEmpty || _passwordCtrl.text.isEmpty) ? null : _submit,
              child: _loading
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('إرسال رابط التأكيد'),
            ),
          ],
        ),
      ),
    );
  }
}
