import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/media.dart';
import '../../../search/domain/entities/search_user.dart';
import '../../../search/presentation/providers/search_providers.dart';

// Tagging (Phase 23 composer addition) reuses the existing Phase 11 user
// search endpoint (GET /search?category=users, via SearchUseCase) instead of
// building a new autocomplete network layer -- tapping a result hands the
// picked SearchUser back to the composer, which inserts "@username" into the
// content textfield at the cursor.
//
// There is no dedicated "tagged users" backend field: CreatePostDto
// (backend/src/posts/dto/create-post.dto.ts) has no such field, so a mention
// is just a plain "@username" token inside `content` -- the same convention
// web's own renderWithHashtags() parses back out of post text (PostCard.tsx).
//
// Note: web's own composer (PostComposer.tsx) declares taggedUsers/
// showTagInput/tagSearch state and a handleTagAdd() function, but no button
// anywhere ever sets showTagInput to true, no dropdown is ever rendered for
// tagSearch, and handleSubmit() never sends taggedUsers to the backend --
// it's dead/unreachable code on web. This is a real, working implementation.
class TagUserSheet extends ConsumerStatefulWidget {
  const TagUserSheet({super.key});

  @override
  ConsumerState<TagUserSheet> createState() => _TagUserSheetState();
}

class _TagUserSheetState extends ConsumerState<TagUserSheet> {
  final _searchCtrl = TextEditingController();
  Timer? _debounce;
  List<SearchUser> _results = const [];
  bool _loading = false;
  bool _searched = false;

  @override
  void dispose() {
    _debounce?.cancel();
    _searchCtrl.dispose();
    super.dispose();
  }

  void _onChanged(String value) {
    _debounce?.cancel();
    final query = value.trim();
    if (query.isEmpty) {
      setState(() {
        _results = const [];
        _searched = false;
      });
      return;
    }
    _debounce = Timer(const Duration(milliseconds: 350), () => _search(query));
  }

  Future<void> _search(String query) async {
    setState(() => _loading = true);
    try {
      final results = await ref.read(searchUseCaseProvider).call(q: query, category: 'users');
      if (!mounted) return;
      setState(() {
        _results = results.users;
        _loading = false;
        _searched = true;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _searched = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: EdgeInsets.only(
          left: 16,
          right: 16,
          top: 16,
          bottom: MediaQuery.of(context).viewInsets.bottom + 16,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('وسم صديق', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 10),
            TextField(
              controller: _searchCtrl,
              autofocus: true,
              onChanged: _onChanged,
              decoration: const InputDecoration(hintText: 'ابحث بالاسم...', prefixIcon: Icon(Icons.search)),
            ),
            const SizedBox(height: 10),
            SizedBox(
              height: 280,
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : !_searched
                      ? const Center(child: Text('اكتب اسماً للبحث', style: TextStyle(color: AppTheme.textSecondary)))
                      : _results.isEmpty
                          ? const Center(child: Text('لا نتائج', style: TextStyle(color: AppTheme.textSecondary)))
                          : ListView.builder(
                              itemCount: _results.length,
                              itemBuilder: (context, i) {
                                final user = _results[i];
                                final avatarUrl = resolveMediaUrl(user.avatarUrl);
                                return ListTile(
                                  leading: CircleAvatar(
                                    backgroundImage: avatarUrl != null ? NetworkImage(avatarUrl) : null,
                                    child: avatarUrl == null
                                        ? Text(user.fullName.isNotEmpty ? user.fullName[0] : '؟')
                                        : null,
                                  ),
                                  title: Text(user.fullName),
                                  subtitle: user.username != null ? Text('@${user.username}') : null,
                                  onTap: () => Navigator.of(context).pop(user),
                                );
                              },
                            ),
            ),
          ],
        ),
      ),
    );
  }
}
