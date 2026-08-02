import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/routes.dart';
import '../providers/auth_providers.dart';
import '../widgets/auth_text_field.dart';

// Matches backend/src/auth/dto/change-email.dto.ts's ConfirmEmailChangeDto --
// also a randomBytes(32).toString('hex') token, same shape as verify-email
// and reset-password.
final _tokenRegex = RegExp(r'^[0-9a-f]{64}$');

// Mobile equivalent of web's (auth)/verify-email-change/page.tsx: confirms a
// pending email-change request (started from settings' "change email" form,
// which is out of this phase's scope -- mobile/lib/features/settings/) using
// the token emailed to the NEW address. Same manual-paste pattern as
// reset_password_screen.dart / confirm_email_verification_screen.dart --
// no deep-link infra exists to auto-fill this from a tapped link.
//
// A successful confirm invalidates all sessions server-side (forces
// re-login), matching web's "Please log in again" copy.
class ConfirmEmailChangeScreen extends ConsumerStatefulWidget {
  const ConfirmEmailChangeScreen({super.key});

  @override
  ConsumerState<ConfirmEmailChangeScreen> createState() => _ConfirmEmailChangeScreenState();
}

class _ConfirmEmailChangeScreenState extends ConsumerState<ConfirmEmailChangeScreen> {
  final _formKey = GlobalKey<FormState>();
  final _tokenCtrl = TextEditingController();
  bool _loading = false;
  bool _success = false;
  String? _error;

  @override
  void dispose() {
    _tokenCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate() || _loading) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await ref.read(confirmEmailChangeUseCaseProvider).call(token: _tokenCtrl.text.trim());
      if (!mounted) return;
      setState(() => _success = true);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = 'الرابط غير صالح أو منتهي الصلاحية');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('تأكيد تغيير البريد الإلكتروني')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: _success
              ? Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.green.shade50,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'تم تحديث بريدك الإلكتروني. يرجى تسجيل الدخول مرة أخرى.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.green.shade700),
                      ),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () => context.go(AppRoutes.login),
                      child: const Text('تسجيل الدخول'),
                    ),
                  ],
                )
              : Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text(
                        'الصق رمز التأكيد المرسل إلى بريدك الإلكتروني الجديد',
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 24),

                      if (_error != null) ...[
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.red.shade50,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(_error!, style: TextStyle(color: Colors.red.shade700)),
                        ),
                        const SizedBox(height: 16),
                      ],

                      AuthTextField(
                        controller: _tokenCtrl,
                        label: 'رمز التأكيد',
                        hint: 'الصق الرمز هنا',
                        validator: (v) {
                          if (v == null || v.trim().isEmpty) return 'الرمز مطلوب';
                          if (!_tokenRegex.hasMatch(v.trim())) return 'صيغة الرمز غير صحيحة';
                          return null;
                        },
                      ),
                      const SizedBox(height: 24),

                      ElevatedButton(
                        onPressed: _loading ? null : _submit,
                        child: _loading
                            ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                            : const Text('تأكيد'),
                      ),
                    ],
                  ),
                ),
        ),
      ),
    );
  }
}
