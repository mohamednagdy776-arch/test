import '../entities/search_results.dart';
import '../entities/search_suggestion.dart';

abstract class SearchRepository {
  Future<SearchResults> search({
    String? q,
    String? category, // 'users' | 'groups' | 'pages' | 'events' | 'posts'
    String? gender,
    int? minAge,
    int? maxAge,
    String? country,
    String? city,
  });

  Future<List<SearchSuggestion>> autocomplete(String q);
}
