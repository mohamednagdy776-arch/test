import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/match.dart';
import '../providers/matching_providers.dart';
import '../state/matches_state.dart';
import 'match_detail_screen.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/media.dart';

class MatchesScreen extends ConsumerStatefulWidget {
  const MatchesScreen({super.key});

  @override
  ConsumerState<MatchesScreen> createState() => _MatchesScreenState();
}

class _MatchesScreenState extends ConsumerState<MatchesScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  bool _showFilters = false;
  late final TextEditingController _ageMinController;
  late final TextEditingController _ageMaxController;
  late final TextEditingController _locationController;
  String _religiousCommitment = '';

  static const _tabs = [
    (AppConstants.matchPending, 'قيد الانتظار'),
    (AppConstants.matchAccepted, 'مقبول'),
    (AppConstants.matchRejected, 'مرفوض'),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        ref.read(matchesProvider.notifier).load(status: _tabs[_tabController.index].$1);
      }
    });
    _ageMinController = TextEditingController(text: '18');
    _ageMaxController = TextEditingController(text: '45');
    _locationController = TextEditingController();
    Future.microtask(() {
      ref.read(matchesProvider.notifier).load(status: _tabs.first.$1);
      ref.read(matchesProvider.notifier).loadStats();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _ageMinController.dispose();
    _ageMaxController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  void _applyFilters() {
    final ageMin = int.tryParse(_ageMinController.text) ?? 18;
    final ageMax = int.tryParse(_ageMaxController.text) ?? 45;
    ref.read(matchesProvider.notifier).load(
          ageMin: ageMin,
          ageMax: ageMax,
          location: _locationController.text.trim(),
          religiousCommitment: _religiousCommitment,
        );
  }

  void _clearFilters() {
    setState(() {
      _ageMinController.text = '18';
      _ageMaxController.text = '45';
      _locationController.clear();
      _religiousCommitment = '';
    });
    ref.read(matchesProvider.notifier).clearFilters();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(matchesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('التوافق'),
        bottom: TabBar(controller: _tabController, tabs: [for (final t in _tabs) Tab(text: t.$2)]),
        actions: [
          IconButton(
            icon: Icon(_showFilters || state.hasFilters ? Icons.filter_alt : Icons.filter_alt_outlined),
            tooltip: 'الفلاتر',
            onPressed: () => setState(() => _showFilters = !_showFilters),
          ),
          IconButton(
            icon: state.isGenerating
                ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2))
                : const Icon(Icons.refresh),
            onPressed: state.isGenerating ? null : () => ref.read(matchesProvider.notifier).generate(),
          ),
        ],
      ),
      body: Column(
        children: [
          _StatsHeader(state: state),
          if (_showFilters)
            _FilterPanel(
              ageMinController: _ageMinController,
              ageMaxController: _ageMaxController,
              locationController: _locationController,
              religiousCommitment: _religiousCommitment,
              hasFilters: state.hasFilters,
              onCommitmentChanged: (v) => setState(() => _religiousCommitment = v),
              onApply: _applyFilters,
              onClear: _clearFilters,
            ),
          Expanded(child: _buildBody(state)),
        ],
      ),
    );
  }

  Widget _buildBody(MatchesState state) {
    if (state.isLoading && state.items.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }
    if (state.error != null && state.items.isEmpty) {
      return Center(child: Text(state.error!));
    }
    if (state.items.isEmpty) {
      return const Center(child: Text('لا توجد توافقات في هذه الفئة'));
    }

    return RefreshIndicator(
      onRefresh: () => ref.read(matchesProvider.notifier).load(),
      child: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: state.items.length,
        itemBuilder: (context, index) => _MatchCard(match: state.items[index]),
      ),
    );
  }
}

class _MatchCard extends ConsumerWidget {
  final Match match;
  const _MatchCard({required this.match});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final avatarUrl = resolveMediaUrl(match.otherUserAvatar);
    final notifier = ref.read(matchesProvider.notifier);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => MatchDetailScreen(match: match)),
        ),
        leading: CircleAvatar(
          backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
          backgroundImage: avatarUrl != null ? NetworkImage(avatarUrl) : null,
          child: avatarUrl == null ? Text((match.otherUserName?.isNotEmpty ?? false) ? match.otherUserName![0] : '?') : null,
        ),
        title: Text(match.otherUserName ?? 'مستخدم'),
        subtitle: Text('نسبة التوافق: ${match.score.toStringAsFixed(0)}%'),
        trailing: match.status == AppConstants.matchPending
            ? Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.red),
                    onPressed: () => notifier.reject(match.id),
                  ),
                  IconButton(
                    icon: const Icon(Icons.check_circle, color: Colors.green),
                    onPressed: () => notifier.accept(match.id),
                  ),
                ],
              )
            : TextButton(
                onPressed: () => match.status == AppConstants.matchAccepted
                    ? notifier.undoAccept(match.id)
                    : notifier.undoReject(match.id),
                child: const Text('تراجع'),
              ),
      ),
    );
  }
}

// Mirrors web's MatchingStats -- four tiles (total/pending/accepted/average
// score) computed off a separate unfiltered read, not off the tab-filtered
// list below.
class _StatsHeader extends StatelessWidget {
  final MatchesState state;
  const _StatsHeader({required this.state});

  @override
  Widget build(BuildContext context) {
    final noDataYet = state.statsTotal == 0 && state.statsPending == 0 && state.statsAccepted == 0;
    if (state.statsLoading && noDataYet) {
      return const Padding(
        padding: EdgeInsets.all(16),
        child: SizedBox(height: 48, child: Center(child: CircularProgressIndicator(strokeWidth: 2))),
      );
    }
    final stats = [
      ('إجمالي التوافقات', '${state.statsTotal}', AppTheme.primaryColor),
      ('في الانتظار', '${state.statsPending}', AppTheme.warningColor),
      ('تم القبول', '${state.statsAccepted}', AppTheme.successColor),
      ('متوسط التوافق', '${state.statsAvgScore.round()}%', AppTheme.accentColor),
    ];
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 4),
      child: GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        mainAxisSpacing: 8,
        crossAxisSpacing: 8,
        childAspectRatio: 2.6,
        children: [
          for (final s in stats)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: s.$3.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: s.$3.withValues(alpha: 0.25)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(s.$2, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: s.$3)),
                  const SizedBox(height: 2),
                  Text(s.$1, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

// Mirrors web's filter panel (age range/location/religious commitment).
// minAge/maxAge/location/religiousCommitment are all real server-side query
// params (curl-verified live) -- Apply re-fetches the current tab with them.
class _FilterPanel extends StatelessWidget {
  final TextEditingController ageMinController;
  final TextEditingController ageMaxController;
  final TextEditingController locationController;
  final String religiousCommitment;
  final bool hasFilters;
  final ValueChanged<String> onCommitmentChanged;
  final VoidCallback onApply;
  final VoidCallback onClear;

  const _FilterPanel({
    required this.ageMinController,
    required this.ageMaxController,
    required this.locationController,
    required this.religiousCommitment,
    required this.hasFilters,
    required this.onCommitmentChanged,
    required this.onApply,
    required this.onClear,
  });

  // Values ('very_committed'/'committed'/'moderate'/'low') match the field's
  // real stored values from ProfileEditForm -- not the 'high'/'medium'/'low'
  // web used to send before it never matched anything server-side (#257).
  static const _commitmentOptions = {
    '': 'الكل',
    'very_committed': 'ملتزم جداً',
    'committed': 'ملتزم',
    'moderate': 'متوسط',
    'low': 'منخفض',
  };

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 0, 12, 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.surfaceColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.textSecondary.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: ageMinController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'العمر من', isDense: true),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: TextField(
                  controller: ageMaxController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'إلى', isDense: true),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          TextField(
            controller: locationController,
            decoration: const InputDecoration(
              labelText: 'الموقع',
              isDense: true,
              prefixIcon: Icon(Icons.location_on_outlined, size: 18),
            ),
          ),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            initialValue: religiousCommitment,
            decoration: const InputDecoration(labelText: 'الالتزام الديني', isDense: true),
            items: [
              for (final entry in _commitmentOptions.entries)
                DropdownMenuItem(value: entry.key, child: Text(entry.value)),
            ],
            onChanged: (v) => onCommitmentChanged(v ?? ''),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              if (hasFilters) TextButton(onPressed: onClear, child: const Text('مسح الفلاتر')),
              const Spacer(),
              FilledButton(onPressed: onApply, child: const Text('تطبيق')),
            ],
          ),
        ],
      ),
    );
  }
}
