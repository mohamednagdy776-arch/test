// GET /search/autocomplete -- curl-verified: { users: [...], groups: [...],
// pages: [...], events: [...] }. Now that Pages/Events are mobile search tabs
// too (Phase 24), all four suggestion types are modeled.
class SearchSuggestion {
  final String type; // 'user' | 'group' | 'page' | 'event'
  final String id;
  final String name;
  final String? subtext;

  const SearchSuggestion({required this.type, required this.id, required this.name, this.subtext});

  static List<SearchSuggestion> fromAutocompleteJson(Map<String, dynamic> json) {
    final result = <SearchSuggestion>[];
    for (final u in (json['users'] as List<dynamic>? ?? const [])) {
      final m = u as Map<String, dynamic>;
      result.add(SearchSuggestion(
        type: 'user',
        id: m['id'] as String,
        name: (m['fullName'] as String?) ?? '${m['firstName'] ?? ''} ${m['lastName'] ?? ''}'.trim(),
        subtext: m['username'] as String?,
      ));
    }
    for (final g in (json['groups'] as List<dynamic>? ?? const [])) {
      final m = g as Map<String, dynamic>;
      result.add(SearchSuggestion(type: 'group', id: m['id'] as String, name: m['name'] as String));
    }
    for (final p in (json['pages'] as List<dynamic>? ?? const [])) {
      final m = p as Map<String, dynamic>;
      result.add(SearchSuggestion(type: 'page', id: m['id'] as String, name: m['name'] as String));
    }
    for (final e in (json['events'] as List<dynamic>? ?? const [])) {
      final m = e as Map<String, dynamic>;
      result.add(SearchSuggestion(type: 'event', id: m['id'] as String, name: m['title'] as String));
    }
    return result;
  }
}
