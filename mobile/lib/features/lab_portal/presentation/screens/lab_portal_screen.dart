import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../../core/constants/theme.dart';
import '../../domain/entities/lab.dart';
import '../../domain/entities/lab_referral_code.dart';
import '../providers/lab_portal_providers.dart';

// Mirrors web/src/app/(main)/lab-portal/page.tsx -- the regular-end-user
// surface only (generate a referral code for an active lab, show your
// history of codes). Deliberately excludes auth/login, scan, and
// results/submit: those back web/src/app/lab/ + web/src/app/lab/scan/, a
// SEPARATE lab-staff/partner portal with its own sessionStorage-based
// lab_token login, entirely outside this app's regular JWT session -- not
// something a dating-app end user would ever sign into.
//
// Phase 30: web renders the code as a scannable QR (react-qr-code,
// `<QRCode value={code.code} size={200} />`) inside a modal, in addition to
// the raw text -- confirmed live in page.tsx. A prior phase skipped this
// (no QR package existed yet) in favor of large selectable monospace text;
// this phase adds qr_flutter and renders an actual QrImageView the
// lab-staff scanner (web/src/app/lab/scan/page.tsx's camera scanner) can
// read directly, on top of keeping the same selectable text below it (that
// scan screen also supports manual code entry as a fallback, so the text
// stays useful too, not replaced).
class LabPortalScreen extends ConsumerStatefulWidget {
  const LabPortalScreen({super.key});

  @override
  ConsumerState<LabPortalScreen> createState() => _LabPortalScreenState();
}

class _LabPortalScreenState extends ConsumerState<LabPortalScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(labPortalProvider.notifier).loadInitial());
  }

  Future<void> _copy(String text) async {
    await Clipboard.setData(ClipboardData(text: text));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم نسخ الكود')));
  }

  Future<void> _generate(Lab lab) async {
    final code = await ref.read(labPortalProvider.notifier).generateCode(lab.id);
    if (code == null || !mounted) return;
    _showCodeSheet(code);
  }

  void _showCodeSheet(LabReferralCode code) {
    showModalBottomSheet<void>(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('اعرض هذا الكود للمختبر', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 4),
            const Text('سيقوم المختبر بإدخال أو مسح الكود للتحقق من هويتك',
                style: TextStyle(fontSize: 12, color: AppTheme.textSecondary), textAlign: TextAlign.center),
            const SizedBox(height: 20),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 20),
              decoration: BoxDecoration(
                color: AppTheme.backgroundColor,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFD9CFB8)),
              ),
              child: Column(
                children: [
                  // Same size web uses (page.tsx: `<QRCode value={code.code}
                  // size={200} />`) so a lab-staff camera scanner gets an
                  // equally scannable target on either platform.
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: QrImageView(
                      data: code.code,
                      size: 200,
                      semanticsLabel: 'رمز الاستجابة السريعة لكود الإحالة',
                    ),
                  ),
                  const SizedBox(height: 16),
                  SelectableText(
                    code.code,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20, letterSpacing: 3, fontFamily: 'monospace'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Text('ينتهي ${DateFormat('yyyy/MM/dd').format(code.expiresAt)}',
                style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: () => _copy(code.code),
                icon: const Icon(Icons.copy),
                label: const Text('نسخ الكود'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(labPortalProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('بوابة المختبرات')),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () => ref.read(labPortalProvider.notifier).loadInitial(),
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  const Text(
                    'أنشئ كود إحالة لإجراء فحوصاتك في مختبر معتمد والحصول على شارة التحقق الصحي',
                    style: TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                  ),
                  if (state.error != null) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: AppTheme.dangerColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                      child: Text(state.error!, style: const TextStyle(color: AppTheme.dangerColor)),
                    ),
                  ],
                  const SizedBox(height: 20),
                  const Text('المختبرات المتاحة', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 8),
                  if (state.labs.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 20),
                      child: Center(child: Text('لا توجد مختبرات نشطة حالياً', style: TextStyle(color: AppTheme.textSecondary))),
                    )
                  else
                    ...state.labs.map((lab) => Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: ListTile(
                            leading: const Icon(Icons.science_outlined, color: AppTheme.primaryColor),
                            title: Text(lab.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            subtitle: lab.commercialRegistration != null
                                ? Text('س.ت: ${lab.commercialRegistration}', style: const TextStyle(fontSize: 11))
                                : null,
                            trailing: FilledButton(
                              onPressed: state.generatingLabId == lab.id ? null : () => _generate(lab),
                              child: Text(state.generatingLabId == lab.id ? '...' : 'إنشاء كود'),
                            ),
                          ),
                        )),
                  const SizedBox(height: 24),
                  Text('أكوادي (${state.referrals.length})', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 8),
                  if (state.referrals.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 20),
                      child: Center(child: Text('لم تقم بإنشاء أي كود بعد', style: TextStyle(color: AppTheme.textSecondary))),
                    )
                  else
                    ...state.referrals.map((code) => _referralTile(code)),
                ],
              ),
            ),
    );
  }

  Widget _referralTile(LabReferralCode code) {
    final (label, color) = code.isUsed
        ? ('مستخدَم', AppTheme.textSecondary)
        : code.isExpired
            ? ('منتهي', AppTheme.dangerColor)
            : ('نشط', AppTheme.successColor);
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        title: Text(
          '${code.code.substring(0, code.code.length > 8 ? 8 : code.code.length)}…',
          style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold, letterSpacing: 1),
        ),
        subtitle: Text('ينتهي ${DateFormat('yyyy/MM/dd').format(code.expiresAt)}', style: const TextStyle(fontSize: 11)),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(20)),
              child: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: color)),
            ),
            if (code.isActive)
              IconButton(
                onPressed: () => _showCodeSheet(code),
                icon: const Icon(Icons.qr_code, size: 20),
              ),
          ],
        ),
      ),
    );
  }
}
