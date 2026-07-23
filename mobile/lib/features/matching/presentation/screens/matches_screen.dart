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
    Future.microtask(() => ref.read(matchesProvider.notifier).load(status: _tabs.first.$1));
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
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
            icon: state.isGenerating
                ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2))
                : const Icon(Icons.refresh),
            onPressed: state.isGenerating ? null : () => ref.read(matchesProvider.notifier).generate(),
          ),
        ],
      ),
      body: _buildBody(state),
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
