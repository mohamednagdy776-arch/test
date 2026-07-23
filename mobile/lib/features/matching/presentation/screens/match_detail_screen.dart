import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/match.dart';
import '../providers/matching_providers.dart';
import '../state/matches_notifier.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/constants/theme.dart';

const _breakdownLabels = {
  'religious': 'التوافق الديني',
  'lifestyle': 'أسلوب الحياة',
  'interests': 'الاهتمامات المشتركة',
  'location': 'الموقع',
  'other': 'عوامل أخرى',
};

class MatchDetailScreen extends ConsumerWidget {
  final Match match;
  const MatchDetailScreen({super.key, required this.match});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(_matchProfileProvider(match.otherUserId));
    final notifier = ref.read(matchesProvider.notifier);

    return Scaffold(
      appBar: AppBar(title: Text(match.otherUserName ?? 'التفاصيل')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Column(
                children: [
                  Text(
                    '${match.score.toStringAsFixed(0)}%',
                    style: Theme.of(context).textTheme.displaySmall?.copyWith(
                          color: AppTheme.primaryColor,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const Text('نسبة التوافق'),
                ],
              ),
            ),
            const SizedBox(height: 24),
            if (match.breakdown != null) ...[
              const Text('تفاصيل التوافق', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              for (final entry in match.breakdown!.entries) _BreakdownBar(label: _breakdownLabels[entry.key] ?? entry.key, value: entry.value),
              const SizedBox(height: 24),
            ],
            profileAsync.when(
              loading: () => const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator())),
              error: (e, _) => const SizedBox.shrink(),
              data: (profile) {
                if (profile.matchReasons.isEmpty) return const SizedBox.shrink();
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('أسباب التوافق', style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    for (final reason in profile.matchReasons)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(Icons.check, size: 18, color: AppTheme.primaryColor),
                            const SizedBox(width: 6),
                            Expanded(child: Text(reason)),
                          ],
                        ),
                      ),
                  ],
                );
              },
            ),
            const SizedBox(height: 24),
            _actions(context, notifier),
          ],
        ),
      ),
    );
  }

  Widget _actions(BuildContext context, MatchesNotifier notifier) {
    if (match.status == AppConstants.matchPending) {
      return Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: () {
                notifier.reject(match.id);
                Navigator.of(context).pop();
              },
              child: const Text('رفض'),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: ElevatedButton(
              onPressed: () {
                notifier.accept(match.id);
                Navigator.of(context).pop();
              },
              child: const Text('قبول'),
            ),
          ),
        ],
      );
    }
    return OutlinedButton(
      onPressed: () {
        match.status == AppConstants.matchAccepted ? notifier.undoAccept(match.id) : notifier.undoReject(match.id);
        Navigator.of(context).pop();
      },
      child: const Text('تراجع'),
    );
  }
}

final _matchProfileProvider = FutureProvider.family((ref, String userId) {
  return ref.read(getMatchProfileUseCaseProvider).call(userId);
});

class _BreakdownBar extends StatelessWidget {
  final String label;
  final double value;
  const _BreakdownBar({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(fontSize: 13)),
              Text('${value.toStringAsFixed(0)}%', style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary)),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: (value / 100).clamp(0, 1),
              minHeight: 6,
              backgroundColor: const Color(0xFFE7DFC9),
              color: AppTheme.accentColor,
            ),
          ),
        ],
      ),
    );
  }
}
