import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/memories_providers.dart';
import '../../../posts/domain/entities/post.dart';
import '../../../posts/presentation/screens/post_detail_screen.dart';
import '../../../saved/presentation/providers/saved_providers.dart';
import '../../../saved/presentation/widgets/saved_item_tile.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/extensions.dart';
import '../../../../core/utils/media.dart';

// Matches web/src/app/(main)/memories/page.tsx's two tabs: "on this day"
// memories, and the same saved-items list also shown on the standalone
// /saved page -- reuses the saved feature's provider/tile rather than a
// second implementation of the same list.
class MemoriesScreen extends ConsumerStatefulWidget {
  const MemoriesScreen({super.key});

  @override
  ConsumerState<MemoriesScreen> createState() => _MemoriesScreenState();
}

class _MemoriesScreenState extends ConsumerState<MemoriesScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  int? _selectedYear;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    Future.microtask(() {
      ref.read(memoriesProvider.notifier).loadInitial();
      ref.read(savedProvider.notifier).loadInitial();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _removeSaved(String itemId) async {
    try {
      await ref.read(savedProvider.notifier).unsave(itemId);
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تعذّر إزالة العنصر')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final memories = ref.watch(memoriesProvider);
    final saved = ref.watch(savedProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('المحفوظات والذكريات'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [Tab(text: 'ذكريات'), Tab(text: 'المحفوظات')],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          memories.isLoading
              ? const Center(child: CircularProgressIndicator())
              : memories.error != null
                  ? Center(child: Text(memories.error!))
                  : memories.memories.isEmpty
                      ? const Center(child: Text('لا توجد ذكريات حتى الآن'))
                      : _buildMemories(memories.memories),
          saved.isLoading
              ? const Center(child: CircularProgressIndicator())
              : saved.error != null
                  ? Center(child: Text(saved.error!))
                  : saved.items.isEmpty
                      ? const Center(child: Text('لا توجد عناصر محفوظة'))
                      : ListView.builder(
                          padding: const EdgeInsets.all(12),
                          itemCount: saved.items.length,
                          itemBuilder: (context, i) {
                            final item = saved.items[i];
                            return SavedItemTile(item: item, onRemove: () => _removeSaved(item.id));
                          },
                        ),
        ],
      ),
    );
  }

  Widget _buildMemories(List<Post> memories) {
    final years = {for (final m in memories) m.createdAt.year}.toList()..sort((a, b) => b - a);
    final filtered = _selectedYear == null
        ? memories
        : memories.where((m) => m.createdAt.year == _selectedYear).toList();

    return RefreshIndicator(
      onRefresh: () => ref.read(memoriesProvider.notifier).refresh(),
      child: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          if (years.length > 1)
            SizedBox(
              height: 40,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  ChoiceChip(
                    label: const Text('الكل'),
                    selected: _selectedYear == null,
                    onSelected: (_) => setState(() => _selectedYear = null),
                  ),
                  const SizedBox(width: 6),
                  for (final y in years) ...[
                    ChoiceChip(
                      label: Text('$y'),
                      selected: _selectedYear == y,
                      onSelected: (_) => setState(() => _selectedYear = y),
                    ),
                    const SizedBox(width: 6),
                  ],
                ],
              ),
            ),
          const SizedBox(height: 12),
          for (final post in filtered) _MemoryCard(post: post),
        ],
      ),
    );
  }
}

class _MemoryCard extends StatelessWidget {
  final Post post;
  const _MemoryCard({required this.post});

  @override
  Widget build(BuildContext context) {
    final mediaUrl = resolveMediaUrl(post.mediaUrl);
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => PostDetailScreen(postId: post.id)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.calendar_today_outlined, size: 16, color: AppTheme.accentColor),
                  const SizedBox(width: 6),
                  Text(post.createdAt.timeAgo, style: const TextStyle(color: AppTheme.accentColor, fontWeight: FontWeight.w600)),
                ],
              ),
              const SizedBox(height: 8),
              Text(post.authorName, style: const TextStyle(fontWeight: FontWeight.w600)),
              if (post.content.isNotEmpty) ...[
                const SizedBox(height: 6),
                Text(post.content),
              ],
              if (mediaUrl != null) ...[
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(mediaUrl, fit: BoxFit.cover, width: double.infinity),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
