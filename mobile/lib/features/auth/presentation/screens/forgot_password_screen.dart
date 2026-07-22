import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../providers/auth_providers.dart';
import '../widgets/auth_text_field.dart';

const _cooldownSeconds = 60;
const _cooldownPrefsKey = 'forgot_password_cooldown_until';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
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
    _restoreCooldown();
  }

  @override
  void dispose() {
    _ticker?.cancel();
    _emailCtrl.dispose();
    super.dispose();
  }

  // Cooldown survives an app restart -- stored as an absolute epoch instead
  // of just counting down in memory.
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
      await ref.read(forgotPasswordUseCaseProvider).call(email: _emailCtrl.text.trim());
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
      appBar: AppBar(title: const Text('نسيت كلمة المرور')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور',
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
                      'إذا كان البريد مسجلاً لدينا، سيصلك رابط إعادة التعيين خلال دقائق.',
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
                  onPressed: () => context.push('/reset-password'),
                  child: const Text('لدي رمز إعادة تعيين بالفعل'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
