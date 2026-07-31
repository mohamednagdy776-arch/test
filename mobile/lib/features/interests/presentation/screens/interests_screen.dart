import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/person_summary.dart';
import '../providers/interests_providers.dart';
import '../state/interests_state.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/media.dart';
import '../../../profile/presentation/screens/public_profile_screen.dart';

// Matches web/src/app/(main)/interests/page.tsx's three tabs: received,
// sent, and "who viewed my profile" (GET /users/me/profile-views). Rows now
// link out to PublicProfileScreen (mirrors web's PersonCard linking to
// /:username) -- a prior phase note here said no such screen existed yet;
// it does now (Phase 20), so the send/withdraw interest action for THESE
// rows can also happen from the profile itself, not only MatchDetailScreen.
class InterestsScreen extends ConsumerStatefulWidget {
  const InterestsScreen({super.key});

  @override
  ConsumerState<InterestsScreen> createState() => _InterestsScreenState();
}

class _InterestsScreenState extends ConsumerState<InterestsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(interestsProvider.notifier).loadInitial());
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(interestsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('الاهتمامات')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: SegmentedButton<InterestsTab>(
              segments: const [
                ButtonSegment(value: InterestsTab.received, label: Text('المهتمون بك')),
                ButtonSegment(value: InterestsTab.sent, label: Text('اهتماماتك')),
                ButtonSegment(value: InterestsTab.views, label: Text('من شاهد ملفك')),
              ],
              selected: {state.tab},
              onSelectionChanged: (s) => ref.read(interestsProvider.notifier).setTab(s.first),
            ),
          ),
          Expanded(child: _buildBody(state)),
        ],
      ),
    );
  }

  Widget _buildBody(InterestsState state) {
    if (state.isLoading) return const Center(child: CircularProgressIndicator());
    if (state.error != null) return Center(child: Text(state.error!));

    switch (state.tab) {
      case InterestsTab.received:
        if (state.received.isEmpty) return const _Empty(text: 'لم يهتم بك أحد بعد');
        return _list(state.received.map((r) => (r.user, r.status)).toList());
      case InterestsTab.sent:
        if (state.sent.isEmpty) {
          return const _Empty(text: 'أرسل اهتمامك لمن يعجبك من خلال زر "أرسل السلام" في ملفهم');
        }
        return _list(state.sent.map((r) => (r.user, r.status)).toList());
      case InterestsTab.views:
        if (state.views.isEmpty) return const _Empty(text: 'لم يشاهد أحد ملفك بعد');
        return _list(state.views.map((v) => (v.user, null)).toList());
    }
  }

  Widget _list(List<(PersonSummary, String?)> rows) {
    return RefreshIndicator(
      onRefresh: () => ref.read(interestsProvider.notifier).refresh(),
      child: ListView.separated(
        padding: const EdgeInsets.all(12),
        itemCount: rows.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (context, i) {
          final (user, status) = rows[i];
          final avatarUrl = resolveMediaUrl(user.avatarUrl);
          return Card(
            child: ListTile(
              onTap: user.id.isEmpty
                  ? null
                  : () => Navigator.of(context).push(MaterialPageRoute(
                        builder: (_) => PublicProfileScreen(
                          userId: user.id,
                          initialName: user.displayName,
                          initialAvatarUrl: user.avatarUrl,
                        ),
                      )),
              leading: CircleAvatar(
                backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
                backgroundImage: avatarUrl != null ? NetworkImage(avatarUrl) : null,
                child: avatarUrl == null ? Text(user.displayName.isNotEmpty ? user.displayName[0] : '؟') : null,
              ),
              title: Text(user.displayName, style: const TextStyle(fontWeight: FontWeight.w600)),
              subtitle: status == 'mutual' ? const Text('اهتمام متبادل 🎉', style: TextStyle(color: AppTheme.accentColor)) : null,
            ),
          );
        },
      ),
    );
  }
}

class _Empty extends StatelessWidget {
  final String text;
  const _Empty({required this.text});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('💚', style: TextStyle(fontSize: 32)),
            const SizedBox(height: 8),
            Text(text, textAlign: TextAlign.center, style: const TextStyle(color: AppTheme.textSecondary)),
          ],
        ),
      ),
    );
  }
}
