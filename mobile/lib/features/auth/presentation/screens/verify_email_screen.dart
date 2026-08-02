import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/constants/routes.dart';
import '../providers/auth_providers.dart';
import '../widgets/auth_text_field.dart';

// Mirrors web's (auth)/verify-email/page.tsx when it has no ?token= query
// param -- the resend-email form. Mobile has no deep-link infra (see
// reset_password_screen.dart's comment) so there's no way to auto-detect a
// token from a tapped link; this screen is the resend entry point, and
// confirm_email_verification_screen.dart (linked below) is where a token the
// user copy-pasted from the email gets submitted -- same forgot->reset
// password split, applied to email verification.
//
// NOTE: this whole flow is currently moot on the live backend --
// AuthService.register() hardcodes isVerified: true and login()'s
// verification check is commented out server-side (confirmed live
// 2026-08-02), so nothing actually requires verification right now. Built
// so it's ready once that's re-enabled; the resend-verification request/
// response contract itself is live and working today (curl-verified).
const _cooldownSeconds = 60;
const _cooldownPrefsKey = 'verify_email_resend_cooldown_until';

class VerifyEmailScreen extends ConsumerStatefulWidget {
  const VerifyEmailScreen({super.key});

  @override
  ConsumerState<VerifyEmailScreen> createState() => _VerifyEmailScreenState();
}

class _VerifyEmailScreenState extends ConsumerState<VerifyEmailScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  Timer? _ticker;
  int _cooldownRemaining = 0;
  bool _loading = false;
  bool _sent = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    Future.microtask(_restoreCooldown);
  }

  @override
  void dispose() {
    _ticker?.cancel();
    _emailCtrl.dispose();
    super.dispose();
  }

  Future<void> _restoreCooldown() async {
    final prefs = await SharedPreferences.getInstance();
    final until = prefs.getInt(_cooldownPrefsKey) ?? 0;
    final remaining = ((until - DateTime.now().millisecondsSinceEpoch) / 1000).ceil();
    if (remaining > 0) _startTicker(remaining);
  }

  void _startTicker(int seconds) {
    setState(() => _cooldownRemaining = seconds);
    _ticker?.cancel();
    _ticker = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      setState(() => _cooldownRemaining--);
      if (_cooldownRemaining <= 0) timer.cancel();
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate() || _loading || _cooldownRemaining > 0) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await ref.read(resendVerificationUseCaseProvider).call(email: _emailCtrl.text.trim());
      final until = DateTime.now().add(const Duration(seconds: _cooldownSeconds));
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt(_cooldownPrefsKey, until.millisecondsSinceEpoch);
      if (!mounted) return;
      setState(() => _sent = true);
      _startTicker(_cooldownSeconds);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = 'تعذّر إرسال الطلب، حاول مرة أخرى');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('تحقق من البريد الإلكتروني')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'أدخل بريدك الإلكتروني وسنرسل لك رابط تفعيل الحساب',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),

                if (_sent)
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text(
                      'إذا كان حسابك موجوداً وغير مُفعّل، سيصلك رابط التفعيل خلال دقائق.',
                      textAlign: TextAlign.center,
                    ),
                  ),
                if (_error != null)
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(_error!, style: TextStyle(color: Colors.red.shade700)),
                  ),
                if (_sent || _error != null) const SizedBox(height: 16),

                AuthTextField(
                  controller: _emailCtrl,
                  label: 'Email',
                  hint: 'you@example.com',
                  keyboardType: TextInputType.emailAddress,
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Email is required';
                    if (!v.contains('@')) return 'Enter a valid email';
                    return null;
                  },
                ),
                const SizedBox(height: 24),

                ElevatedButton(
                  onPressed: (_loading || _cooldownRemaining > 0) ? null : _submit,
                  child: _loading
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                      : Text(_cooldownRemaining > 0
                          ? 'أعد المحاولة خلال $_cooldownRemainingث'
                          : (_sent ? 'إعادة الإرسال' : 'إرسال')),
                ),
                const SizedBox(height: 16),

                TextButton(
                  onPressed: () => context.push(AppRoutes.verifyEmailConfirm),
                  child: const Text('لدي رمز تفعيل بالفعل'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
