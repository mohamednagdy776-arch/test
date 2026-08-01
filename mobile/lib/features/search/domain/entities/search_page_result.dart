// GET /search?category=pages -- curl-verified: the search endpoint's page
// query only selects id/name/description/category (backend/src/search/
// services/search.service.ts's pageSearch()), a much narrower shape than the
// dedicated /pages endpoints (CommunityPage requires `username`, which this
// response never includes). A dedicated lightweight model instead of reusing
// CommunityPage.fromJson, which would throw on the missing required field.
class SearchPageResult {
  final String id;
  final String name;
  final String? description;
  final String? category;

  const SearchPageResult({
    required this.id,
    required this.name,
    this.description,
    this.category,
  });

  factory SearchPageResult.fromJson(Map<String, dynamic> json) {
    return SearchPageResult(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      category: json['category'] as String?,
    );
  }
}
