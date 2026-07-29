import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/saved_search.dart';
import '../providers/search_providers.dart';

// No dedicated web page was found for saved searches (#757) -- it isn't
// surfaced as its own route on web, only the underlying controller exists.
// A simple standalone list-then-apply screen pushed from SearchScreen's
// AppBar is enough for mobile v1, same "lightweight StatefulWidget" pattern
// used for ArchivedStoriesScreen/CollectionDetailScreen elsewhere in this
// app. Returns the selected SavedSearch to the caller so SearchScreen can
// re-run it.
class SavedSearchesScreen extends ConsumerStatefulWidget {
  const SavedSearchesScreen({super.key});

  @override
  ConsumerState<SavedSearchesScreen> createState() => _SavedSearchesScreenState();
}

class _SavedSearchesScreenState extends ConsumerState<SavedSearchesScreen> {
  bool _loading = true;
  String? _error;
  List<SavedSearch> _searches = const [];

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
      final searches = await ref.read(getSavedSearchesUseCaseProvider)();
      if (!mounted) return;
      setState(() {
        _searches = searches;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'تعذّر تحميل عمليات البحث المحفوظة';
        _loading = false;
      });
    }
  }

  Future<void> _delete(String id) async {
    try {
      await ref.read(deleteSavedSearchUseCaseProvider)(id);
      if (!mounted) return;
      setState(() => _searches = _searches.where((s) => s.id != id).toList());
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تعذّر حذف البحث المحفوظ')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('عمليات البحث المحفوظة')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : _searches.isEmpty
                  ? const Center(child: Text('لا توجد عمليات بحث محفوظة'))
                  : ListView.builder(
                      padding: const EdgeInsets.all(12),
                      itemCount: _searches.length,
                      itemBuilder: (context, i) {
                        final s = _searches[i];
                        final q = s.filters['q'] as String?;
                        return Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: ListTile(
                            leading: const Icon(Icons.bookmark_outline),
                            title: Text(s.name),
                            subtitle: q != null && q.isNotEmpty ? Text(q) : null,
                            onTap: () => Navigator.of(context).pop(s),
                            trailing: IconButton(
                              icon: const Icon(Icons.delete_outline),
                              onPressed: () => _delete(s.id),
                            ),
                          ),
                        );
                      },
                    ),
    );
  }
}
