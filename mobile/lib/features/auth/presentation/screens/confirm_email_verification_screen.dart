import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/routes.dart';
import '../providers/auth_providers.dart';
import '../widgets/auth_text_field.dart';

// Matches backend/src/auth/dto/verify-email.dto.ts: randomBytes(32).toString('hex').
final _tokenRegex = RegExp(r'^[0-9a-f]{64}$');

// Mirrors web's (auth)/verify-email/page.tsx when it HAS a ?token= query
// param -- except mobile can't auto-detect the token (no deep-link infra,
// see reset_password_screen.dart), so the user pastes it in, same pattern
// as reset_password_screen.dart itself.
class ConfirmEmailVerificationScreen extends ConsumerStatefulWidget {
  const ConfirmEmailVerificationScreen({super.key});

  @override
  ConsumerState<ConfirmEmailVerificationScreen> createState() => _ConfirmEmailVerificationScreenState();
}

class _ConfirmEmailVerificationScreenState extends ConsumerState<ConfirmEmailVerificationScreen> {
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
      await ref.read(verifyEmailUseCaseProvider).call(token: _tokenCtrl.text.trim());
      if (!mounted) return;
      setState(() => _success = true);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = 'الرمز غير صحيح أو منتهي الصلاحية');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('تفعيل البريد الإلكتروني')),
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
                        'تم التحقق من بريدك الإلكتروني وتفعيل حسابك بنجاح',
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
                        'الصق رمز التفعيل المرسل إلى بريدك الإلكتروني',
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
                        label: 'رمز التفعيل',
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
                            : const Text('تفعيل'),
                      ),
                    ],
                  ),
                ),
        ),
      ),
    );
  }
}
