// GET /search/autocomplete -- curl-verified: { users: [...], groups: [...],
// pages: [...], events: [...] }. Only 'user' and 'group' types are modeled --
// pages/events aren't mobile features in this phase (out of scope), so those
// arrays are ignored rather than surfaced as dead suggestion entries.
class SearchSuggestion {
  final String type; // 'user' | 'group'
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
    return result;
  }
}
