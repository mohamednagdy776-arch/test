import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/theme.dart';
import '../../../profile/presentation/providers/profile_providers.dart';
import '../../domain/entities/family_relationship.dart';
import '../providers/family_providers.dart';

// Mirrors web/src/app/(main)/family/page.tsx. NOT a genealogy/family-tree
// feature -- a guardian/ward oversight system: invite someone (by their raw
// user UUID, same as web -- there's no username/email lookup endpoint on
// FamilyController, just `guardianUserId`) to be your guardian, they accept
// or reject, and either side can revoke afterwards. `GET
// /family/ward/:wardId/activity-summary` exists on the backend but web's own
// family page never calls it (no guardian-chat link either) -- so it's
// deliberately NOT built here either, to stay at parity with what the
// reference page actually surfaces rather than exceeding it on a hunch.
const _typeLabels = <String, String>{
  'father': 'أب',
  'mother': 'أم',
  'brother': 'أخ',
  'wali': 'ولي أمر',
};

const _typeIcons = <String, String>{
  'father': '👨',
  'mother': '👩',
  'brother': '🧑',
};

class FamilyScreen extends ConsumerStatefulWidget {
  const FamilyScreen({super.key});

  @override
  ConsumerState<FamilyScreen> createState() => _FamilyScreenState();
}

class _FamilyScreenState extends ConsumerState<FamilyScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(familyProvider.notifier).loadInitial());
  }

  Future<void> _copyMyUuid(String uuid) async {
    await Clipboard.setData(ClipboardData(text: uuid));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم نسخ المعرّف')));
  }

  Future<void> _openInviteDialog() async {
    final idCtrl = TextEditingController();
    String type = 'father';
    await showDialog<void>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) {
          final state = ref.watch(familyProvider);
          return AlertDialog(
            title: const Text('دعوة ولي أمر'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('أدخل معرّف المستخدم (UUID) الخاص بولي الأمر', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                const SizedBox(height: 8),
                TextField(
                  controller: idCtrl,
                  decoration: const InputDecoration(labelText: 'معرّف المستخدم'),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: type,
                  decoration: const InputDecoration(labelText: 'صلة القرابة'),
                  items: _typeLabels.entries
                      .map((e) => DropdownMenuItem(value: e.key, child: Text(e.value)))
                      .toList(),
                  onChanged: (v) => setDialogState(() => type = v ?? type),
                ),
                if (state.error != null) ...[
                  const SizedBox(height: 8),
                  Text(state.error!, style: const TextStyle(color: AppTheme.dangerColor, fontSize: 12)),
                ],
              ],
            ),
            actions: [
              TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('إلغاء')),
              FilledButton(
                onPressed: state.isInviting || idCtrl.text.trim().isEmpty
                    ? null
                    : () async {
                        final ok = await ref
                            .read(familyProvider.notifier)
                            .invite(guardianUserId: idCtrl.text.trim(), type: type);
                        if (ok && context.mounted) Navigator.of(context).pop();
                      },
                child: Text(state.isInviting ? 'جارٍ الإرسال...' : 'إرسال الدعوة'),
              ),
            ],
          );
        },
      ),
    );
  }

  Future<void> _confirmRevoke(String relationshipId, String title) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: const Text('هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.'),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('إلغاء')),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppTheme.dangerColor),
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('تأكيد'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await ref.read(familyProvider.notifier).revoke(relationshipId);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(familyProvider);
    final myProfileAsync = ref.watch(myProfileProvider);

    final wardInvites = state.wards.where((r) => r.status == 'pending').toList();
    final activeGuardians = state.guardians.where((r) => r.status == 'active').toList();
    final pendingSent = state.guardians.where((r) => r.status == 'pending').toList();
    final revoked = state.guardians.where((r) => r.status == 'revoked').toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('الأسرة'),
        actions: [
          IconButton(onPressed: _openInviteDialog, icon: const Icon(Icons.person_add_alt_1)),
        ],
      ),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () => ref.read(familyProvider.notifier).loadInitial(),
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  const Text(
                    'إدارة علاقات الولاية (أولياء الأمور والمولّى عليهم)',
                    style: TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                  ),
                  const SizedBox(height: 16),
                  // Inviting a guardian requires knowing THEIR UUID, but there
                  // was no way to find/copy your OWN UUID either (#111) --
                  // same fix mirrored here.
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('معرّفك (UUID)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                const SizedBox(height: 4),
                                Text(
                                  myProfileAsync.value?.userId ?? '...',
                                  style: const TextStyle(fontSize: 11, fontFamily: 'monospace', color: AppTheme.textSecondary),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            onPressed: myProfileAsync.value?.userId == null
                                ? null
                                : () => _copyMyUuid(myProfileAsync.value!.userId!),
                            icon: const Icon(Icons.copy, size: 18),
                          ),
                        ],
                      ),
                    ),
                  ),
                  if (state.error != null && !state.isInviting) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppTheme.dangerColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(state.error!, style: const TextStyle(color: AppTheme.dangerColor)),
                    ),
                  ],
                  if (wardInvites.isNotEmpty) ...[
                    const SizedBox(height: 20),
                    Text('دعوات واردة (${wardInvites.length})',
                        style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.accentColor)),
                    const SizedBox(height: 8),
                    ...wardInvites.map((r) => _wardInviteCard(r)),
                  ],
                  if (activeGuardians.isNotEmpty) ...[
                    const SizedBox(height: 20),
                    Text('أولياء الأمور النشطون (${activeGuardians.length})',
                        style: const TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    ...activeGuardians.map((r) => _relCard(r, canRevoke: true)),
                  ],
                  if (pendingSent.isNotEmpty) ...[
                    const SizedBox(height: 20),
                    Text('دعوات مُرسلة قيد الانتظار (${pendingSent.length})',
                        style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.accentColor)),
                    const SizedBox(height: 8),
                    ...pendingSent.map((r) => _relCard(r, canRevoke: true)),
                  ],
                  if (revoked.isNotEmpty) ...[
                    const SizedBox(height: 20),
                    Text('السجل الملغى (${revoked.length})',
                        style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textSecondary)),
                    const SizedBox(height: 8),
                    Opacity(opacity: 0.6, child: Column(children: revoked.map((r) => _relCard(r, canRevoke: false)).toList())),
                  ],
                  if (state.guardians.isEmpty && state.wards.isEmpty) ...[
                    const SizedBox(height: 60),
                    const Center(
                      child: Column(
                        children: [
                          Icon(Icons.shield_outlined, size: 56, color: AppTheme.textSecondary),
                          SizedBox(height: 12),
                          Text('لا توجد علاقات ولاية بعد', style: TextStyle(fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    Center(
                      child: FilledButton(onPressed: _openInviteDialog, child: const Text('دعوة ولي أمر الآن')),
                    ),
                  ],
                ],
              ),
            ),
    );
  }

  Widget _wardInviteCard(FamilyRelationship r) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(color: AppTheme.backgroundColor, borderRadius: BorderRadius.circular(12)),
              alignment: Alignment.center,
              child: Text(_typeIcons[r.relationshipType] ?? '🛡️', style: const TextStyle(fontSize: 20)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('دعوة لتكون ${_typeLabels[r.relationshipType] ?? r.relationshipType}',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 2),
                  Text('من: ${r.wardUserId}', style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary), overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
            TextButton(
              onPressed: () => _confirmRevoke(r.id, 'رفض الدعوة'),
              child: const Text('رفض'),
            ),
            FilledButton(
              onPressed: () => ref.read(familyProvider.notifier).accept(r.id),
              child: const Text('قبول'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _relCard(FamilyRelationship r, {required bool canRevoke}) {
    final statusLabel = switch (r.status) {
      'active' => 'نشطة',
      'pending' => 'قيد الانتظار',
      'revoked' => 'ملغاة',
      _ => r.status,
    };
    final statusColor = switch (r.status) {
      'active' => AppTheme.successColor,
      'pending' => AppTheme.accentColor,
      'revoked' => AppTheme.dangerColor,
      _ => AppTheme.textSecondary,
    };
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(color: AppTheme.backgroundColor, borderRadius: BorderRadius.circular(12)),
              alignment: Alignment.center,
              child: Text(_typeIcons[r.relationshipType] ?? '🛡️', style: const TextStyle(fontSize: 20)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(_typeLabels[r.relationshipType] ?? r.relationshipType,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 2),
                  Text(r.guardianUserId, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary), overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(20)),
                  child: Text(statusLabel, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: statusColor)),
                ),
                if (canRevoke)
                  TextButton(
                    onPressed: () => _confirmRevoke(r.id, 'إلغاء العلاقة'),
                    style: TextButton.styleFrom(foregroundColor: AppTheme.dangerColor, padding: EdgeInsets.zero),
                    child: const Text('إلغاء', style: TextStyle(fontSize: 11)),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
