import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/saved_collection.dart';
import '../../domain/entities/saved_item.dart';
import '../providers/saved_providers.dart';
import '../widgets/saved_item_tile.dart';

// A single collection's items -- pushed directly with the already-fetched
// SavedCollection (no GoRoute), same precedent as match/chat/group detail
// screens elsewhere in this app.
class CollectionDetailScreen extends ConsumerStatefulWidget {
  final SavedCollection collection;
  const CollectionDetailScreen({super.key, required this.collection});

  @override
  ConsumerState<CollectionDetailScreen> createState() => _CollectionDetailScreenState();
}

class _CollectionDetailScreenState extends ConsumerState<CollectionDetailScreen> {
  bool _loading = true;
  String? _error;
  List<SavedItem> _items = const [];

  @override
  void initState() {
    super.initState();
    Future.microtask(_load);
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final items = await ref.read(getCollectionItemsUseCaseProvider)(widget.collection.id);
      if (!mounted) return;
      setState(() {
        _items = items;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'تعذّر تحميل عناصر المجموعة';
        _loading = false;
      });
    }
  }

  Future<void> _remove(String itemId) async {
    try {
      await ref.read(unsaveItemUseCaseProvider)(itemId);
      if (!mounted) return;
      setState(() => _items = _items.where((i) => i.id != itemId).toList());
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تعذّر إزالة العنصر')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.collection.name)),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : _items.isEmpty
                  ? const Center(child: Text('لا توجد عناصر في هذه المجموعة'))
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(12),
                        itemCount: _items.length,
                        itemBuilder: (context, i) {
                          final item = _items[i];
                          return SavedItemTile(item: item, onRemove: () => _remove(item.id));
                        },
                      ),
                    ),
    );
  }
}
