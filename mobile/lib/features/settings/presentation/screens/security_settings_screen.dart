import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/routes.dart';
import '../../../../core/constants/theme.dart';
import '../providers/settings_providers.dart';
import '../../domain/entities/session.dart';
import '../../../auth/presentation/providers/auth_providers.dart';

// Mirrors web's settings/security/page.tsx: sessions, 2FA, change password,
// delete account. Web renders the 2FA setup QR with react-qr-code; no
// QR-rendering package exists in this project yet, so mobile shows the
// manual-entry secret + otpauth URL as selectable text instead (every
// authenticator app supports pasting a secret manually).
class SecuritySettingsScreen extends ConsumerStatefulWidget {
  const SecuritySettingsScreen({super.key});

  @override
  ConsumerState<SecuritySettingsScreen> createState() => _SecuritySettingsScreenState();
}

class _SecuritySettingsScreenState extends ConsumerState<SecuritySettingsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(securityProvider.notifier).loadAll());
  }

  Future<void> _confirmAndRevoke(UserSession session) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('إلغاء الجلسة'),
        content: Text('هل أنت متأكد من إلغاء جلسة "${session.deviceName}"؟'),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('إلغاء')),
          TextButton(onPressed: () => Navigator.of(context).pop(true), child: const Text('تأكيد')),
        ],
      ),
    );
    if (confirmed == true) {
      await ref.read(securityProvider.notifier).revokeSession(session.id);
    }
  }

  Future<void> _confirmAndRevokeAll() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('إلغاء جميع الجلسات'),
        content: const Text('هل أنت متأكد من إلغاء جميع الجلسات الأخرى؟ ستحتاج إلى تسجيل الدخول من جديد على الأجهزة الأخرى.'),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('إلغاء')),
          TextButton(onPressed: () => Navigator.of(context).pop(true), child: const Text('تأكيد')),
        ],
      ),
    );
    if (confirmed == true) {
      await ref.read(securityProvider.notifier).revokeAllOtherSessions();
    }
  }

  Future<void> _startEnable2FA() async {
    final setupData = await ref.read(securityProvider.notifier).setup2FA();
    if (setupData == null || !mounted) return;
    final codeCtrl = TextEditingController();
    String? error;
    await showDialog<void>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('تفعيل التحقق بخطوتين'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('أدخل هذا الرمز يدوياً في تطبيق المصادقة:'),
                const SizedBox(height: 8),
                SelectableText(
                  setupData['secret'] as String? ?? '',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: codeCtrl,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  decoration: const InputDecoration(labelText: 'رمز التحقق'),
                ),
                if (error != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(error!, style: const TextStyle(color: AppTheme.dangerColor)),
                  ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('إلغاء')),
            FilledButton(
              onPressed: () async {
                final ok = await ref.read(securityProvider.notifier).verify2FA(codeCtrl.text.trim());
                if (ok && context.mounted) {
                  Navigator.of(context).pop();
                } else {
                  setDialogState(() => error = 'رمز التحقق غير صحيح');
                }
              },
              child: const Text('تأكيد'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _confirmDisable2FA() async {
    final codeCtrl = TextEditingController();
    String? error;
    await showDialog<void>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('إلغاء التحقق بخطوتين'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('لإلغاء التحقق بخطوتين، أدخل رمز التحقق من التطبيق'),
              const SizedBox(height: 12),
              TextField(
                controller: codeCtrl,
                keyboardType: TextInputType.number,
                maxLength: 6,
                decoration: const InputDecoration(labelText: 'رمز التحقق'),
              ),
              if (error != null)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text(error!, style: const TextStyle(color: AppTheme.dangerColor)),
                ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('إلغاء')),
            FilledButton(
              style: FilledButton.styleFrom(backgroundColor: AppTheme.dangerColor),
              onPressed: () async {
                final ok = await ref.read(securityProvider.notifier).disable2FA(codeCtrl.text.trim());
                if (ok && context.mounted) {
                  Navigator.of(context).pop();
                } else {
                  setDialogState(() => error = 'رمز التحقق غير صحيح');
                }
              },
              child: const Text('إلغاء التفعيل'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _openChangePassword() async {
    final formKey = GlobalKey<FormState>();
    final oldCtrl = TextEditingController();
    final newCtrl = TextEditingController();
    final confirmCtrl = TextEditingController();
    String? error;
    bool success = false;
    await showDialog<void>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('تغيير كلمة المرور'),
          content: SingleChildScrollView(
            child: Form(
              key: formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(controller: oldCtrl, obscureText: true, decoration: const InputDecoration(labelText: 'كلمة المرور الحالية')),
                  const SizedBox(height: 8),
                  TextField(controller: newCtrl, obscureText: true, decoration: const InputDecoration(labelText: 'كلمة المرور الجديدة')),
                  const SizedBox(height: 8),
                  TextField(controller: confirmCtrl, obscureText: true, decoration: const InputDecoration(labelText: 'تأكيد كلمة المرور الجديدة')),
                  if (error != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Text(error!, style: const TextStyle(color: AppTheme.dangerColor)),
                    ),
                  if (success)
                    const Padding(
                      padding: EdgeInsets.only(top: 8),
                      child: Text('تم تغيير كلمة المرور بنجاح', style: TextStyle(color: AppTheme.successColor)),
                    ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('إغلاق')),
            FilledButton(
              onPressed: () async {
                if (newCtrl.text != confirmCtrl.text) {
                  setDialogState(() => error = 'كلمتا المرور غير متطابقتين');
                  return;
                }
                if (newCtrl.text.length < 8) {
                  setDialogState(() => error = 'يجب أن تكون كلمة المرور 8 أحرف على الأقل');
                  return;
                }
                final strong = RegExp(r'[a-z]').hasMatch(newCtrl.text) &&
                    RegExp(r'[A-Z]').hasMatch(newCtrl.text) &&
                    RegExp(r'\d').hasMatch(newCtrl.text) &&
                    RegExp(r'[^a-zA-Z0-9]').hasMatch(newCtrl.text);
                if (!strong) {
                  setDialogState(() => error = 'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم ورمز خاص');
                  return;
                }
                final result = await ref.read(securityProvider.notifier).changePassword(oldCtrl.text, newCtrl.text);
                setDialogState(() {
                  error = result;
                  success = result == null;
                });
              },
              child: const Text('تغيير كلمة المرور'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _confirmDeleteAccount() async {
    final passwordCtrl = TextEditingController();
    String? error;
    await showDialog<void>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('حذف الحساب'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('هل أنت متأكد من طلب حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.'),
              const SizedBox(height: 8),
              const Text(
                'سيتم حذف جميع منشوراتك، صورك، رسائلك، وأصدقائك نهائياً',
                style: TextStyle(color: AppTheme.dangerColor, fontSize: 12),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: passwordCtrl,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'كلمة المرور للتأكيد'),
              ),
              if (error != null)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text(error!, style: const TextStyle(color: AppTheme.dangerColor)),
                ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('إلغاء')),
            FilledButton(
              style: FilledButton.styleFrom(backgroundColor: AppTheme.dangerColor),
              onPressed: () async {
                if (passwordCtrl.text.trim().isEmpty) {
                  setDialogState(() => error = 'يرجى إدخال كلمة المرور للتأكيد');
                  return;
                }
                final result = await ref.read(securityProvider.notifier).deleteAccount(passwordCtrl.text);
                if (result == null) {
                  await ref.read(authRepositoryProvider).logout().catchError((_) {});
                  if (context.mounted) {
                    Navigator.of(context).pop();
                    context.go(AppRoutes.login);
                  }
                } else {
                  setDialogState(() => error = result);
                }
              },
              child: const Text('تأكيد الحذف'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(securityProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('الأمان')),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () => ref.read(securityProvider.notifier).loadAll(),
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  if (state.error != null)
                    Container(
                      padding: const EdgeInsets.all(12),
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(
                        color: AppTheme.dangerColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(state.error!, style: const TextStyle(color: AppTheme.dangerColor)),
                    ),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('إدارة الجلسات', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          const SizedBox(height: 8),
                          if (state.sessions.isEmpty)
                            const Padding(
                              padding: EdgeInsets.symmetric(vertical: 12),
                              child: Text('لا توجد جلسات'),
                            )
                          else
                            ...state.sessions.map((s) => ListTile(
                                  contentPadding: EdgeInsets.zero,
                                  leading: const Icon(Icons.devices_other),
                                  title: Text(s.deviceName.isEmpty ? 'جهاز غير معروف' : s.deviceName),
                                  subtitle: Text('${s.browser} · ${s.ipAddress}'),
                                  trailing: TextButton(
                                    onPressed: () => _confirmAndRevoke(s),
                                    child: const Text('إلغاء', style: TextStyle(color: AppTheme.dangerColor)),
                                  ),
                                )),
                          if (state.sessions.length > 1)
                            Align(
                              alignment: Alignment.centerLeft,
                              child: OutlinedButton(
                                onPressed: _confirmAndRevokeAll,
                                style: OutlinedButton.styleFrom(foregroundColor: AppTheme.dangerColor),
                                child: const Text('إلغاء جميع الجلسات الأخرى'),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Card(
                    child: ListTile(
                      leading: Icon(state.twoFactorEnabled ? Icons.verified_user : Icons.lock_outline),
                      title: const Text('التحقق بخطوتين'),
                      subtitle: Text(state.twoFactorEnabled ? 'مفعّل · حسابك محمي' : 'غير مفعّل'),
                      trailing: state.twoFactorEnabled
                          ? OutlinedButton(
                              onPressed: _confirmDisable2FA,
                              style: OutlinedButton.styleFrom(foregroundColor: AppTheme.dangerColor),
                              child: const Text('إلغاء التفعيل'),
                            )
                          : FilledButton(onPressed: _startEnable2FA, child: const Text('تفعيل')),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Card(
                    child: ListTile(
                      leading: const Icon(Icons.password_outlined),
                      title: const Text('تغيير كلمة المرور'),
                      trailing: const Icon(Icons.chevron_left),
                      onTap: _openChangePassword,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Card(
                    color: AppTheme.dangerColor.withValues(alpha: 0.06),
                    child: ListTile(
                      leading: const Icon(Icons.warning_amber_outlined, color: AppTheme.dangerColor),
                      title: const Text('حذف الحساب', style: TextStyle(color: AppTheme.dangerColor)),
                      subtitle: const Text('طلب حذف حسابك بشكل نهائي'),
                      trailing: FilledButton(
                        style: FilledButton.styleFrom(backgroundColor: AppTheme.dangerColor),
                        onPressed: _confirmDeleteAccount,
                        child: const Text('حذف'),
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
