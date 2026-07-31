import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/theme.dart';
import '../providers/premium_providers.dart';

class _PlanInfo {
  final String id;
  final String name;
  final int? price; // null == free
  final Color color;
  final List<String> features;
  const _PlanInfo(this.id, this.name, this.price, this.color, this.features);
}

// Plan catalogue mirrors web/src/app/(main)/upgrade/page.tsx's hardcoded
// `plans`/`ALL_FEATURES` arrays -- there's no GET /plans (or similar)
// endpoint on the backend, so web hardcodes this client-side too and mobile
// does the same.
//
// Deliberately NOT built here: web's monthly/annual billing toggle and its
// card-entry "PaymentModal". CreateSubscriptionDto has no billing-period
// field at all (confirmed against the DTO and live), so the annual price is
// purely cosmetic math on web with no effect on what's actually created --
// nothing to have parity with. And POST /subscriptions creates the
// subscription record directly with no payment step whatsoever (verified:
// no Stripe/checkout-session endpoint exists in backend/src/payments/, and
// creating a subscription live via curl succeeds immediately with no charge
// of any kind) -- web's card-number/CVV modal collects input that is never
// sent anywhere before calling the same direct-create endpoint. Presenting
// that fake card form here would be actively misleading, so this screen
// goes straight from plan selection to a plain confirmation dialog that's
// honest about what will happen.
const _plans = [
  _PlanInfo('free', 'أساسي', null, AppTheme.primaryColor, [
    'إنشاء ملف شخصي',
    'البحث الأساسي',
    '5 توافقات يومياً',
    'الانضمام لمجتمعات',
  ]),
  _PlanInfo('premium', 'متميز', 99, AppTheme.primaryColor, [
    'كل ميزات الأساسي',
    'توافقات غير محدودة',
    'تحليلات معمقة',
    'أولوية في البحث',
    'شارة مميز',
    'دعم ذو أولوية',
  ]),
  _PlanInfo('family', 'عائلي', 149, AppTheme.accentColor, [
    'كل ميزات المتميز',
    '3 حسابات فرعية',
    'إشراف ولي الأمر',
    'تقارير شهرية',
    'مستشار زواج مخصص',
  ]),
];

class PremiumScreen extends ConsumerStatefulWidget {
  const PremiumScreen({super.key});

  @override
  ConsumerState<PremiumScreen> createState() => _PremiumScreenState();
}

class _PremiumScreenState extends ConsumerState<PremiumScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(premiumProvider.notifier).loadInitial());
  }

  Future<void> _confirmSubscribe(_PlanInfo plan) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('تأكيد الاشتراك'),
        content: Text(
          plan.price == null
              ? 'الاشتراك في الخطة ${plan.name} مجاني.'
              : 'سيتم تفعيل خطة ${plan.name} مقابل ${plan.price} ر.س شهرياً. لا توجد بوابة دفع مفعّلة حالياً -- سيتم تفعيل الاشتراك مباشرة.',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('إلغاء')),
          TextButton(onPressed: () => Navigator.of(context).pop(true), child: const Text('تأكيد')),
        ],
      ),
    );
    if (confirmed != true) return;
    await ref.read(premiumProvider.notifier).subscribe(plan.id);
  }

  Future<void> _confirmCancel(String subscriptionId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('إلغاء الاشتراك'),
        content: const Text('هل أنت متأكد من إلغاء اشتراكك الحالي؟ ستبقى ميزاتك متاحة حتى نهاية الفترة الحالية.'),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('تراجع')),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('تأكيد الإلغاء', style: TextStyle(color: AppTheme.dangerColor)),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await ref.read(premiumProvider.notifier).cancel(subscriptionId);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(premiumProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('الترقية المميزة')),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () => ref.read(premiumProvider.notifier).loadInitial(),
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
                  ..._plans.map((plan) => _buildPlanCard(context, state, plan)),
                  if (state.active?.isActive == true && state.activePlan != 'free') ...[
                    const SizedBox(height: 8),
                    Center(
                      child: Column(
                        children: [
                          Text(
                            'ينتهي اشتراكك في: ${_formatDate(state.active!.endDate)}',
                            style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                          ),
                          const SizedBox(height: 8),
                          TextButton(
                            onPressed: state.isMutating ? null : () => _confirmCancel(state.active!.id),
                            child: Text(
                              state.isMutating ? 'جارٍ الإلغاء...' : 'إلغاء الاشتراك الحالي',
                              style: const TextStyle(color: AppTheme.dangerColor),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
    );
  }

  Widget _buildPlanCard(BuildContext context, dynamic state, _PlanInfo plan) {
    final isCurrent = state.activePlan == plan.id;
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: isCurrent ? plan.color : const Color(0xFFE7DFC9), width: isCurrent ? 2 : 1),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(plan.name, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: plan.color)),
                if (isCurrent)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(color: plan.color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(999)),
                    child: Text('خطتك الحالية', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: plan.color)),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              plan.price == null ? 'مجاناً' : '${plan.price} ر.س / شهرياً',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            ...plan.features.map((f) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 2),
                  child: Row(
                    children: [
                      Icon(Icons.check_circle, size: 16, color: plan.color),
                      const SizedBox(width: 8),
                      Expanded(child: Text(f, style: const TextStyle(fontSize: 13))),
                    ],
                  ),
                )),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: isCurrent || plan.id == 'free' || state.isMutating
                    ? null
                    : () => _confirmSubscribe(plan),
                style: FilledButton.styleFrom(backgroundColor: plan.color),
                child: Text(isCurrent ? 'نشط حالياً' : state.isMutating ? 'جارٍ الاشتراك...' : 'اشترك الآن'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  }
}
