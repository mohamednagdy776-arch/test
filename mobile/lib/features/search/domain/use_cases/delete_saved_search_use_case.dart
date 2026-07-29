import '../repositories/saved_searches_repository.dart';

class DeleteSavedSearchUseCase {
  final SavedSearchesRepository _repository;
  const DeleteSavedSearchUseCase(this._repository);

  Future<void> call(String id) => _repository.deleteSavedSearch(id);
}
