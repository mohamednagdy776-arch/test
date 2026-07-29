import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/saved_providers.dart';
import '../widgets/saved_item_tile.dart';
import 'collection_detail_screen.dart';

// Matches web/src/app/(main)/saved/page.tsx (flat list of saved items, with
// remove) plus a "Collections" tab surfacing the full CRUD the backend
// supports (backend/src/memories/controllers/saved.controller.ts's
// collections routes) even though the current web page doesn't render a
// collections UI of its own -- the endpoints are real and otherwise
// unreachable from any client.
class SavedScreen extends ConsumerStatefulWidget {
  const SavedScreen({super.key});

  @override
  ConsumerState<SavedScreen> createState() => _SavedScreenState();
}

class _SavedScreenState extends ConsumerState<SavedScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) setState(() {});
    });
    Future.microtask(() {
      ref.read(savedProvider.notifier).loadInitial();
      ref.read(collectionsProvider.notifier).loadInitial();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _createCollection() async {
    final controller = TextEditingController();
    final name = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('مجموعة جديدة'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(hintText: 'اسم المجموعة'),
          autofocus: true,
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('إلغاء')),
          TextButton(
            onPressed: () => Navigator.of(context).pop(controller.text.trim()),
            child: const Text('إنشاء'),
          ),
        ],
      ),
    );
    if (name == null || name.isEmpty) return;
    try {
      await ref.read(collectionsProvider.notifier).createCollection(name);
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تعذّر إنشاء المجموعة')));
    }
  }

  Future<void> _removeSaved(String itemId) async {
    try {
      await ref.read(savedProvider.notifier).unsave(itemId);
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تعذّر إزالة العنصر')));
    }
  }

  Future<void> _deleteCollection(String id) async {
    try {
      await ref.read(collectionsProvider.notifier).deleteCollection(id);
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تعذّر حذف المجموعة')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final saved = ref.watch(savedProvider);
    final collections = ref.watch(collectionsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('المحفوظات'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [Tab(text: 'الكل'), Tab(text: 'المجموعات')],
        ),
      ),
      floatingActionButton: _tabController.index == 1
          ? FloatingActionButton(onPressed: _createCollection, child: const Icon(Icons.add))
          : null,
      body: TabBarView(
        controller: _tabController,
        children: [
          // All saved items
          saved.isLoading
              ? const Center(child: CircularProgressIndicator())
              : saved.error != null
                  ? Center(child: Text(saved.error!))
                  : saved.items.isEmpty
                      ? const Center(child: Text('لا توجد عناصر محفوظة بعد'))
                      : RefreshIndicator(
                          onRefresh: () => ref.read(savedProvider.notifier).refresh(),
                          child: ListView.builder(
                            padding: const EdgeInsets.all(12),
                            itemCount: saved.items.length,
                            itemBuilder: (context, i) {
                              final item = saved.items[i];
                              return SavedItemTile(item: item, onRemove: () => _removeSaved(item.id));
                            },
                          ),
                        ),
          // Collections
          collections.isLoading
              ? const Center(child: CircularProgressIndicator())
              : collections.error != null
                  ? Center(child: Text(collections.error!))
                  : collections.collections.isEmpty
                      ? const Center(child: Text('لا توجد مجموعات بعد، أنشئ واحدة بزر +'))
                      : RefreshIndicator(
                          onRefresh: () => ref.read(collectionsProvider.notifier).refresh(),
                          child: ListView.builder(
                            padding: const EdgeInsets.all(12),
                            itemCount: collections.collections.length,
                            itemBuilder: (context, i) {
                              final c = collections.collections[i];
                              return Card(
                                margin: const EdgeInsets.only(bottom: 12),
                                child: ListTile(
                                  leading: const Icon(Icons.folder_outlined),
                                  title: Text(c.name),
                                  onTap: () => Navigator.of(context).push(
                                    MaterialPageRoute(builder: (_) => CollectionDetailScreen(collection: c)),
                                  ),
                                  trailing: IconButton(
                                    icon: const Icon(Icons.delete_outline),
                                    onPressed: () => _deleteCollection(c.id),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
        ],
      ),
    );
  }
}
