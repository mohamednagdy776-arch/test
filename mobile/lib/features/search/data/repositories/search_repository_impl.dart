import '../../domain/entities/search_results.dart';
import '../../domain/entities/search_suggestion.dart';
import '../../domain/repositories/search_repository.dart';
import '../data_sources/search_remote_data_source.dart';

class SearchRepositoryImpl implements SearchRepository {
  final SearchRemoteDataSource _remoteDataSource;
  const SearchRepositoryImpl(this._remoteDataSource);

  @override
  Future<SearchResults> search({
    String? q,
    String? category,
    String? gender,
    int? minAge,
    int? maxAge,
    String? country,
    String? city,
  }) async {
    final data = await _remoteDataSource.search(
      q: q,
      category: category,
      gender: gender,
      minAge: minAge,
      maxAge: maxAge,
      country: country,
      city: city,
    );
    return SearchResults.fromJson(data);
  }

  @override
  Future<List<SearchSuggestion>> autocomplete(String q) async {
    final data = await _remoteDataSource.autocomplete(q);
    return SearchSuggestion.fromAutocompleteJson(data);
  }
}
