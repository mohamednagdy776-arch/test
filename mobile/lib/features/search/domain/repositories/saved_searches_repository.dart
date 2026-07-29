import '../entities/saved_search.dart';

abstract class SavedSearchesRepository {
  Future<List<SavedSearch>> getSavedSearches();
  Future<SavedSearch> createSavedSearch(String name, Map<String, dynamic> filters);
  Future<void> deleteSavedSearch(String id);
}
