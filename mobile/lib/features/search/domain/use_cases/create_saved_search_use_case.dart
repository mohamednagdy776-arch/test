import '../entities/saved_search.dart';
import '../repositories/saved_searches_repository.dart';

class CreateSavedSearchUseCase {
  final SavedSearchesRepository _repository;
  const CreateSavedSearchUseCase(this._repository);

  Future<SavedSearch> call(String name, Map<String, dynamic> filters) =>
      _repository.createSavedSearch(name, filters);
}
