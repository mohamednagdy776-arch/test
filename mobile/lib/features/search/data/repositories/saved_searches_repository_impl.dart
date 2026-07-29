import '../../domain/entities/saved_search.dart';
import '../../domain/repositories/saved_searches_repository.dart';
import '../data_sources/saved_searches_remote_data_source.dart';

class SavedSearchesRepositoryImpl implements SavedSearchesRepository {
  final SavedSearchesRemoteDataSource _remote;
  const SavedSearchesRepositoryImpl(this._remote);

  @override
  Future<List<SavedSearch>> getSavedSearches() async {
    final items = await _remote.getSavedSearches();
    return items.map(SavedSearch.fromJson).toList();
  }

  @override
  Future<SavedSearch> createSavedSearch(String name, Map<String, dynamic> filters) async {
    final json = await _remote.createSavedSearch(name, filters);
    return SavedSearch.fromJson(json);
  }

  @override
  Future<void> deleteSavedSearch(String id) => _remote.deleteSavedSearch(id);
}
