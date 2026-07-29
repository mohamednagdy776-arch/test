import '../entities/saved_search.dart';
import '../repositories/saved_searches_repository.dart';

class GetSavedSearchesUseCase {
  final SavedSearchesRepository _repository;
  const GetSavedSearchesUseCase(this._repository);

  Future<List<SavedSearch>> call() => _repository.getSavedSearches();
}
