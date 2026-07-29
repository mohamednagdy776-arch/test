import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/search_suggestion.dart';
import '../../domain/entities/search_user.dart';
import '../../../groups/domain/entities/group.dart';
import '../../../posts/domain/entities/post.dart';
import '../../../groups/presentation/screens/group_detail_screen.dart';
import '../../../friends/presentation/providers/friends_providers.dart';
import '../providers/search_providers.dart';
import '../state/search_state.dart';
import '../../domain/entities/saved_search.dart';
import 'saved_searches_screen.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/media.dart';
import '../../../../core/utils/extensions.dart';

// Mirrors web/src/features/search/components/SearchPage.tsx's core flow
// (query + tabs + results). Deliberately simplified for mobile v1: only
// People/Groups/Posts tabs (Pages/Events aren't mobile features in this
// phase -- out of scope); a compact People-only filter row (gender + age
// range) instead of the full Advanced-Search panel per tab.
// Saved searches (#757, backend/src/saved-searches) are now wired in via
// the two bookmark actions below -- no dedicated web page surfaces them
// (only the controller exists), so this is a from-scratch mobile entry
// point rather than a port of an existing web panel.
class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _controller = TextEditingController();
  Timer? _debounce;
  String? _gender;

  @override
  void dispose() {
    _debounce?.cancel();
    _controller.dispose();
    super.dispose();
  }

  void _onChanged(String value) {
    ref.read(searchProvider.notifier).setQuery(value);
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 600), () {
      if (value.trim().isNotEmpty) {
        ref.read(searchProvider.notifier).runSearch(gender: _gender);
      }
    });
  }

  void _runNow() {
    _debounce?.cancel();
    ref.read(searchProvider.notifier).runSearch(gender: _gender);
  }

  Future<void> _openSavedSearches() async {
    final selected = await Navigator.of(context).push<SavedSearch>(
      MaterialPageRoute(builder: (_) => const SavedSearchesScreen()),
    );
    if (selected == null) return;
    final q = selected.filters['q'] as String? ?? '';
    setState(() => _gender = selected.filters['gender'] as String?);
    _controller.text = q;
    ref.read(searchProvider.notifier).setQuery(q);
    ref.read(searchProvider.notifier).runSearch(
          gender: selected.filters['gender'] as String?,
          minAge: selected.filters['minAge'] as int?,
          maxAge: selected.filters['maxAge'] as int?,
          country: selected.filters['country'] as String?,
          city: selected.filters['city'] as String?,
        );
  }

  Future<void> _saveCurrentSearch() async {
    final controller = TextEditingController(text: ref.read(searchProvider).query);
    final name = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('حفظ البحث'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(hintText: 'اسم البحث المحفوظ'),
          autofocus: true,
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('إلغاء')),
          TextButton(
            onPressed: () => Navigator.of(context).pop(controller.text.trim()),
            child: const Text('حفظ'),
          ),
        ],
      ),
    );
    if (name == null || name.isEmpty) return;
    final state = ref.read(searchProvider);
    try {
      await ref.read(createSavedSearchUseCaseProvider)(name, {
        'q': state.query,
        if (_gender != null) 'gender': _gender,
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم حفظ البحث')));
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تعذّر حفظ البحث')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(searchProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('البحث'),
        actions: [
          if (state.hasSearched)
            IconButton(
              icon: const Icon(Icons.bookmark_add_outlined),
              tooltip: 'حفظ هذا البحث',
              onPressed: _saveCurrentSearch,
            ),
          IconButton(
            icon: const Icon(Icons.bookmark_outline),
            tooltip: 'عمليات البحث المحفوظة',
            onPressed: _openSavedSearches,
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              children: [
                TextField(
                  controller: _controller,
                  onChanged: _onChanged,
                  onSubmitted: (_) => _runNow(),
                  decoration: InputDecoration(
                    hintText: 'ابحث بالاسم أو المجتمع أو المنشور...',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: state.query.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.close),
                            onPressed: () {
                              _controller.clear();
                              ref.read(searchProvider.notifier).clear();
                            },
                          )
                        : null,
                  ),
                ),
                const SizedBox(height: 8),
                SegmentedButton<SearchTab>(
                  segments: const [
                    ButtonSegment(value: SearchTab.people, label: Text('الأشخاص')),
                    ButtonSegment(value: SearchTab.groups, label: Text('المجتمعات')),
                    ButtonSegment(value: SearchTab.posts, label: Text('المنشورات')),
                  ],
                  selected: {state.tab},
                  onSelectionChanged: (s) => ref.read(searchProvider.notifier).setTab(s.first),
                ),
                if (state.tab == SearchTab.people) ...[
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Text('الجنس: '),
                      ChoiceChip(
                        label: const Text('الكل'),
                        selected: _gender == null,
                        onSelected: (_) => setState(() => _gender = null),
                      ),
                      const SizedBox(width: 6),
                      ChoiceChip(
                        label: const Text('ذكر'),
                        selected: _gender == 'male',
                        onSelected: (_) => setState(() => _gender = 'male'),
                      ),
                      const SizedBox(width: 6),
                      ChoiceChip(
                        label: const Text('أنثى'),
                        selected: _gender == 'female',
                        onSelected: (_) => setState(() => _gender = 'female'),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
          if (state.error != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Text(state.error!, style: const TextStyle(color: AppTheme.dangerColor)),
            ),
          Expanded(child: _buildBody(state)),
        ],
      ),
    );
  }

  Widget _buildBody(SearchState state) {
    if (state.suggestions.isNotEmpty && !state.hasSearched) {
      return _SuggestionsList(
        suggestions: state.suggestions,
        onTap: (s) {
          _controller.text = s.name;
          ref.read(searchProvider.notifier).setQuery(s.name);
          _runNow();
        },
      );
    }
    if (state.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (!state.hasSearched) {
      return const Center(child: Text('ابحث عن أشخاص أو مجتمعات أو منشورات', style: TextStyle(color: AppTheme.textSecondary)));
    }

    switch (state.tab) {
      case SearchTab.people:
        return _buildPeopleResults(state.results.users);
      case SearchTab.groups:
        return _buildGroupResults(state.results.groups);
      case SearchTab.posts:
        return _buildPostResults(state.results.posts);
    }
  }

  Widget _buildPeopleResults(List<SearchUser> users) {
    if (users.isEmpty) return const _NoResults();
    return ListView.separated(
      padding: const EdgeInsets.all(12),
      itemCount: users.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (_, i) {
        final u = users[i];
        final avatarUrl = resolveMediaUrl(u.avatarUrl);
        return Card(
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
              backgroundImage: avatarUrl != null ? NetworkImage(avatarUrl) : null,
              child: avatarUrl == null ? Text(u.fullName.isNotEmpty ? u.fullName[0] : '؟') : null,
            ),
            title: Text(u.fullName, style: const TextStyle(fontWeight: FontWeight.w600)),
            subtitle: Text([
              if (u.jobTitle != null) u.jobTitle!,
              if (u.city != null) u.city!,
              if (u.age != null) '${u.age} سنة',
            ].join(' · ')),
            trailing: TextButton(
              onPressed: () async {
                try {
                  await ref.read(respondToFriendRequestUseCaseProvider).send(u.id);
                  if (!mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم إرسال طلب الصداقة')));
                } catch (_) {
                  if (!mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تعذّر إرسال الطلب')));
                }
              },
              child: const Text('إضافة'),
            ),
          ),
        );
      },
    );
  }

  Widget _buildGroupResults(List<Group> groups) {
    if (groups.isEmpty) return const _NoResults();
    return ListView.separated(
      padding: const EdgeInsets.all(12),
      itemCount: groups.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, i) {
        final g = groups[i];
        return Card(
          child: ListTile(
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => GroupDetailScreen(groupId: g.id)),
            ),
            leading: CircleAvatar(
              backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
              child: Text(g.name.isNotEmpty ? g.name[0] : '؟'),
            ),
            title: Text(g.name, style: const TextStyle(fontWeight: FontWeight.w600)),
            subtitle: g.description != null ? Text(g.description!, maxLines: 1, overflow: TextOverflow.ellipsis) : null,
          ),
        );
      },
    );
  }

  Widget _buildPostResults(List<Post> posts) {
    if (posts.isEmpty) return const _NoResults();
    return ListView.separated(
      padding: const EdgeInsets.all(12),
      itemCount: posts.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, i) {
        final p = posts[i];
        return Card(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(p.authorName, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                const SizedBox(height: 4),
                Text(p.content, maxLines: 3, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 4),
                Text(p.createdAt.timeAgo, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _SuggestionsList extends StatelessWidget {
  final List<SearchSuggestion> suggestions;
  final void Function(SearchSuggestion) onTap;
  const _SuggestionsList({required this.suggestions, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: suggestions.length,
      itemBuilder: (context, i) {
        final s = suggestions[i];
        return ListTile(
          leading: Icon(s.type == 'user' ? Icons.person_outline : Icons.groups_outlined),
          title: Text(s.name),
          subtitle: s.subtext != null ? Text(s.subtext!) : null,
          onTap: () => onTap(s),
        );
      },
    );
  }
}

class _NoResults extends StatelessWidget {
  const _NoResults();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.search_off, size: 48, color: AppTheme.textSecondary),
          SizedBox(height: 12),
          Text('لا توجد نتائج', style: TextStyle(color: AppTheme.textSecondary)),
        ],
      ),
    );
  }
}
