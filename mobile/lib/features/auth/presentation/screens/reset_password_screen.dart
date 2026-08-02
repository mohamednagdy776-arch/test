import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/routes.dart';
import '../providers/auth_providers.dart';
import '../widgets/auth_text_field.dart';
import '../widgets/password_strength_meter.dart';

// Matches backend/src/auth/dto/reset-password.dto.ts's PASSWORD_REGEX.
final _passwordRegex = RegExp(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$');
final _tokenRegex = RegExp(r'^[0-9a-f]{64}$');

// This screen requires the reset token to be pasted in by hand (see the
// field below) because the app has no deep-link infrastructure at all:
// checked mobile/pubspec.yaml (no app_links/uni_links), app_router.dart (no
// deep-link handling), AndroidManifest.xml (no <intent-filter> with a VIEW
// action/data scheme), and ios/Runner/Info.plist + .entitlements (no
// CFBundleURLTypes, no associated domains) -- confirmed empty 2026-08-02.
// Wiring up real "tap the emailed link, land straight in the app" auto-
// consumption needs platform configuration this Flutter-only phase can't
// provide on its own: an Android intent-filter (android:autoVerify) plus an
// assetlinks.json hosted at the domain, and iOS associated domains plus an
// apple-app-site-association file hosted at the domain. That's
// infrastructure/hosting work, not something to fake here with a partial
// workaround -- so the manual-paste flow stays the real, supported path.

class ResetPasswordScreen extends ConsumerStatefulWidget {
  const ResetPasswordScreen({super.key});

  @override
  ConsumerState<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends ConsumerState<ResetPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _tokenCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _obscure = true;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _tokenCtrl.dispose();
    _passwordCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate() || _loading) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await ref.read(resetPasswordUseCaseProvider).call(
            token: _tokenCtrl.text.trim(),
            password: _passwordCtrl.text,
          );
      if (!mounted) return;
      context.go(AppRoutes.login);
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
      appBar: AppBar(title: const Text('إعادة تعيين كلمة المرور')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'الصق الرمز المرسل إلى بريدك الإلكتروني، ثم اختر كلمة مرور جديدة',
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
                  label: 'رمز إعادة التعيين',
                  hint: 'الصق الرمز هنا',
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) return 'الرمز مطلوب';
                    if (!_tokenRegex.hasMatch(v.trim())) return 'صيغة الرمز غير صحيحة';
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                AuthTextField(
                  controller: _passwordCtrl,
                  label: 'كلمة المرور الجديدة',
                  hint: '••••••••',
                  obscureText: _obscure,
                  suffixIcon: IconButton(
                    icon: Icon(_obscure ? Icons.visibility_off : Icons.visibility),
                    onPressed: () => setState(() => _obscure = !_obscure),
                  ),
                  validator: (v) {
                    if (v == null || !_passwordRegex.hasMatch(v)) {
                      return '8 أحرف على الأقل، حرف كبير وصغير ورقم ورمز خاص';
                    }
                    return null;
                  },
                  onChanged: (_) => setState(() {}),
                ),
                PasswordStrengthMeter(password: _passwordCtrl.text),
                const SizedBox(height: 16),

                AuthTextField(
                  controller: _confirmCtrl,
                  label: 'تأكيد كلمة المرور',
                  hint: '••••••••',
                  obscureText: _obscure,
                  validator: (v) => v != _passwordCtrl.text ? 'كلمتا المرور غير متطابقتين' : null,
                ),
                const SizedBox(height: 24),

                ElevatedButton(
                  onPressed: _loading ? null : _submit,
                  child: _loading
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('إعادة التعيين'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
