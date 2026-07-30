import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/theme.dart';
import '../providers/settings_providers.dart';
import '../state/consent_state.dart';
import '../../domain/entities/consent_request.dart';

const _typeLabels = {
  'medical_share': 'مشاركة البيانات الطبية',
  'genetic_share': 'مشاركة البيانات الجينية',
};

(String, Color) _statusUi(ConsentStatus status) {
  switch (status) {
    case ConsentStatus.pending:
      return ('⏳ في الانتظار', AppTheme.accentColor);
    case ConsentStatus.accepted:
      return ('✓ مقبول', AppTheme.successColor);
    case ConsentStatus.declined:
      return ('✗ مرفوض', AppTheme.dangerColor);
    case ConsentStatus.expired:
      return ('منتهي الصلاحية', AppTheme.textSecondary);
    case ConsentStatus.revoked:
      return ('ملغي', AppTheme.textSecondary);
    case ConsentStatus.unknown:
      return ('غير معروف', AppTheme.textSecondary);
  }
}

// Mirrors web's settings/consent/page.tsx: incoming/outgoing tabs over
// guardian medical/genetic data-share consent requests (GET /consent/my,
// accept/decline/revoke). Web's own version of this page never actually
// shows any requests in production -- its incoming/outgoing split assumes a
// {incoming, outgoing} response shape but the backend returns a flat array
// with no envelope (confirmed live via curl); mobile splits it correctly
// client-side instead (see ConsentNotifier/SettingsRepositoryImpl).
class ConsentSettingsScreen extends ConsumerStatefulWidget {
  const ConsentSettingsScreen({super.key});

  @override
  ConsumerState<ConsentSettingsScreen> createState() => _ConsentSettingsScreenState();
}

class _ConsentSettingsScreenState extends ConsumerState<ConsentSettingsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(consentProvider.notifier).loadAll());
  }

  Future<void> _confirmRevoke(ConsentRequestItem item) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('سحب الموافقة'),
        content: const Text('هل أنت متأكد من سحب هذه الموافقة؟'),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('إلغاء')),
          TextButton(onPressed: () => Navigator.of(context).pop(true), child: const Text('سحب')),
        ],
      ),
    );
    if (confirmed == true) {
      await ref.read(consentProvider.notifier).revoke(item.id);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(consentProvider);
    final notifier = ref.read(consentProvider.notifier);
    final displayed = state.tab == ConsentTab.incoming ? state.incoming : state.outgoing;
    final pendingIncoming = state.incoming.where((r) => r.status == ConsentStatus.pending).length;

    return Scaffold(
      appBar: AppBar(title: const Text('إدارة الموافقات')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: SegmentedButton<ConsentTab>(
              segments: [
                ButtonSegment(
                  value: ConsentTab.incoming,
                  label: Text(pendingIncoming > 0 ? 'واردة ($pendingIncoming)' : 'واردة'),
                ),
                const ButtonSegment(value: ConsentTab.outgoing, label: Text('صادرة')),
              ],
              selected: {state.tab},
              onSelectionChanged: (s) => notifier.setTab(s.first),
            ),
          ),
          if (state.error != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(state.error!, style: const TextStyle(color: AppTheme.dangerColor)),
            ),
          Expanded(
            child: state.isLoading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: () => notifier.loadAll(),
                    child: displayed.isEmpty
                        ? ListView(
                            children: [
                              SizedBox(
                                height: 300,
                                child: Center(
                                  child: Text(
                                    state.tab == ConsentTab.incoming ? 'لا توجد طلبات واردة' : 'لم ترسل أي طلبات بعد',
                                  ),
                                ),
                              ),
                            ],
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            itemCount: displayed.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 8),
                            itemBuilder: (context, index) {
                              final item = displayed[index];
                              final (statusLabel, statusColor) = _statusUi(item.status);
                              return Card(
                                child: Padding(
                                  padding: const EdgeInsets.all(12),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Text(
                                              _typeLabels[item.consentType] ?? item.consentType,
                                              style: const TextStyle(fontWeight: FontWeight.bold),
                                            ),
                                          ),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: statusColor.withValues(alpha: 0.12),
                                              borderRadius: BorderRadius.circular(20),
                                            ),
                                            child: Text(statusLabel, style: TextStyle(color: statusColor, fontSize: 11)),
                                          ),
                                        ],
                                      ),
                                      if (item.expiresAt != null) ...[
                                        const SizedBox(height: 4),
                                        Text('ينتهي: ${item.expiresAt}', style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                                      ],
                                      if (item.status == ConsentStatus.pending && state.tab == ConsentTab.incoming) ...[
                                        const SizedBox(height: 8),
                                        Row(
                                          children: [
                                            Expanded(
                                              child: FilledButton(
                                                onPressed: () => notifier.respond(item.id, true),
                                                child: const Text('قبول'),
                                              ),
                                            ),
                                            const SizedBox(width: 8),
                                            Expanded(
                                              child: OutlinedButton(
                                                onPressed: () => notifier.respond(item.id, false),
                                                style: OutlinedButton.styleFrom(foregroundColor: AppTheme.dangerColor),
                                                child: const Text('رفض'),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                      if (item.status == ConsentStatus.accepted && state.tab == ConsentTab.outgoing) ...[
                                        const SizedBox(height: 8),
                                        Align(
                                          alignment: Alignment.centerLeft,
                                          child: TextButton(
                                            onPressed: () => _confirmRevoke(item),
                                            child: const Text('سحب الموافقة', style: TextStyle(color: AppTheme.dangerColor)),
                                          ),
                                        ),
                                      ],
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                  ),
          ),
        ],
      ),
    );
  }
}
