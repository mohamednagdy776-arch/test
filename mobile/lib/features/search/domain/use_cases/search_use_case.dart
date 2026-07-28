import '../entities/search_results.dart';
import '../entities/search_suggestion.dart';
import '../repositories/search_repository.dart';

class SearchUseCase {
  final SearchRepository _repository;
  const SearchUseCase(this._repository);

  Future<SearchResults> call({
    String? q,
    String? category,
    String? gender,
    int? minAge,
    int? maxAge,
    String? country,
    String? city,
  }) {
    return _repository.search(
      q: q,
      category: category,
      gender: gender,
      minAge: minAge,
      maxAge: maxAge,
      country: country,
      city: city,
    );
  }

  Future<List<SearchSuggestion>> autocomplete(String q) => _repository.autocomplete(q);
}
