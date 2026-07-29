// GET/POST /saved-searches's live shape (backend/src/saved-searches/
// saved-search.entity.ts). `filters` is an opaque JSON blob -- this app
// writes/reads a fixed subset of keys (q, gender, minAge, maxAge, country,
// city) that map onto SearchNotifier.runSearch's own parameters, but any
// extra keys another client wrote are preserved round-trip since this is
// just Map<String, dynamic>, never destructured into named fields.
class SavedSearch {
  final String id;
  final String name;
  final Map<String, dynamic> filters;
  final DateTime createdAt;

  const SavedSearch({
    required this.id,
    required this.name,
    required this.filters,
    required this.createdAt,
  });

  factory SavedSearch.fromJson(Map<String, dynamic> json) {
    return SavedSearch(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      filters: (json['filters'] as Map<String, dynamic>?) ?? const {},
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
