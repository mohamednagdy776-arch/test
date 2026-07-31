import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/extensions.dart';
import '../providers/affiliates_providers.dart';

// Mirrors web/src/app/(main)/affiliates/page.tsx (join CTA -> dashboard once
// joined, referral code + history, "how it works"). Two deliberate omissions
// from web, both flagged live:
//
// 1. No referral *link* (web builds `${appOrigin}?ref=${code}`) -- a mobile
//    client has no equivalent "current app origin" to build a URL against,
//    and this app's own register screen redeems the code by having the new
//    user paste it into a field (no deep-linking configured), so the code
//    itself is what actually matters here. Sharing is copy-the-code, not a
//    tappable link.
// 2. No "withdraw commission" action -- web's WithdrawModal posts to
//    `/affiliates/payout`, which doesn't exist on the backend
//    (affiliates.controller.ts has no such route; confirmed live: POST
//    /affiliates/payout -> 404 "Cannot POST /api/v1/affiliates/payout").
//    That's a live bug on web too, not something to replicate here -- the
//    commission balance is shown read-only.
class AffiliatesScreen extends ConsumerStatefulWidget {
  const AffiliatesScreen({super.key});

  @override
  ConsumerState<AffiliatesScreen> createState() => _AffiliatesScreenState();
}

class _AffiliatesScreenState extends ConsumerState<AffiliatesScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(affiliatesProvider.notifier).loadInitial());
  }

  Future<void> _copy(String text, String label) async {
    await Clipboard.setData(ClipboardData(text: text));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$label تم النسخ')));
  }

  Future<void> _openJoinDialog() async {
    final codeCtrl = TextEditingController();
    await showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('انضم لبرنامج الإحالة'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('اترك الحقل فارغاً لتوليد كود تلقائي، أو اختر كوداً مخصصاً (4-16 حرف أو رقم).'),
            const SizedBox(height: 12),
            TextField(
              controller: codeCtrl,
              maxLength: 16,
              textCapitalization: TextCapitalization.characters,
              decoration: const InputDecoration(labelText: 'كود مخصص (اختياري)', hintText: 'مثال: AHMED2026'),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('إلغاء')),
          FilledButton(
            onPressed: () async {
              Navigator.of(context).pop();
              await ref.read(affiliatesProvider.notifier).join(referralCode: codeCtrl.text.trim());
            },
            child: const Text('انضم الآن'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(affiliatesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('برنامج الإحالة')),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () => ref.read(affiliatesProvider.notifier).loadInitial(),
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
                  if (state.affiliate == null) _buildJoinCard(state) else ..._buildDashboard(state),
                ],
              ),
            ),
    );
  }

  Widget _buildJoinCard(dynamic state) {
    return Column(
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(color: AppTheme.primaryColor, borderRadius: BorderRadius.circular(20)),
          child: Column(
            children: [
              const Text('🤝', style: TextStyle(fontSize: 40)),
              const SizedBox(height: 12),
              const Text('انضم لبرنامج الإحالة', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              const Text(
                'ساعد الآخرين في إيجاد شريك الحياة واكسب عمولات على كل إحالة ناجحة',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white70, fontSize: 13),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: FilledButton(
            onPressed: state.isJoining ? null : _openJoinDialog,
            child: Text(state.isJoining ? 'جارٍ التسجيل...' : 'انضم الآن مجاناً'),
          ),
        ),
      ],
    );
  }

  List<Widget> _buildDashboard(dynamic state) {
    final affiliate = state.affiliate;
    return [
      Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(color: AppTheme.primaryColor, borderRadius: BorderRadius.circular(20)),
        child: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('أنت شريك طيبت!', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            SizedBox(height: 4),
            Text('شارك كودك وابدأ في كسب العمولات', style: TextStyle(color: Colors.white70, fontSize: 13)),
          ],
        ),
      ),
      const SizedBox(height: 16),
      Row(
        children: [
          Expanded(child: _statCard('${affiliate.totalReferred}', 'إجمالي الإحالات', '👥')),
          const SizedBox(width: 12),
          Expanded(child: _statCard('${affiliate.totalMarriages}', 'زيجات ناجحة', '💍')),
          const SizedBox(width: 12),
          Expanded(child: _statCard('${affiliate.commissionBalance.toStringAsFixed(2)} ر.س', 'رصيد العمولة', '💰')),
        ],
      ),
      const SizedBox(height: 16),
      Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('كود الإحالة', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        border: Border.all(color: const Color(0xFFD9CFB8)),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        affiliate.referralCode,
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, letterSpacing: 2),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  FilledButton(
                    onPressed: () => _copy(affiliate.referralCode as String, 'الكود'),
                    child: const Text('نسخ'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
      const SizedBox(height: 16),
      _buildReferralHistory(state),
      const SizedBox(height: 16),
      Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text('كيف يعمل البرنامج؟', style: TextStyle(fontWeight: FontWeight.bold)),
              SizedBox(height: 8),
              Text('١. شارك كود الإحالة مع الأهل والأصدقاء'),
              SizedBox(height: 4),
              Text('٢. عند تسجيلهم باستخدام كودك تُحسب لك إحالة'),
              SizedBox(height: 4),
              Text('٣. عند إتمام زواج ناجح تحصل على عمولة إضافية'),
              SizedBox(height: 4),
              Text('٤. يُصرف رصيد العمولة عند الطلب'),
            ],
          ),
        ),
      ),
    ];
  }

  Widget _buildReferralHistory(dynamic state) {
    final referrals = state.referrals as List;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('سجل الإحالات (${referrals.length})', style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            if (referrals.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 12),
                child: Text('لا توجد إحالات بعد. شارك كودك لتبدأ!', style: TextStyle(color: AppTheme.textSecondary)),
              )
            else
              ...referrals.map((r) => ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const CircleAvatar(child: Icon(Icons.person_outline)),
                    title: Text('كود: ${r.referralCodeUsed}'),
                    subtitle: Text(r.createdAt.timeAgo),
                    trailing: _statusBadge(r.status as String),
                  )),
          ],
        ),
      ),
    );
  }

  Widget _statusBadge(String status) {
    final label = switch (status) {
      'paid' => '💍 مدفوعة',
      'approved' => '⭐ معتمدة',
      'reversed' => 'ملغاة',
      _ => '👤 قيد المراجعة',
    };
    return Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.primaryColor));
  }

  Widget _statCard(String value, String label, String icon) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        child: Column(
          children: [
            Text(icon, style: const TextStyle(fontSize: 22)),
            const SizedBox(height: 4),
            Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 2),
            Text(label, textAlign: TextAlign.center, style: const TextStyle(fontSize: 10, color: AppTheme.textSecondary)),
          ],
        ),
      ),
    );
  }
}
