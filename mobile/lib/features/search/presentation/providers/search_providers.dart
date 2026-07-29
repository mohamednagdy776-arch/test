import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/data_sources/search_remote_data_source.dart';
import '../../data/repositories/search_repository_impl.dart';
import '../../domain/repositories/search_repository.dart';
import '../../domain/use_cases/search_use_case.dart';
import '../../data/data_sources/saved_searches_remote_data_source.dart';
import '../../data/repositories/saved_searches_repository_impl.dart';
import '../../domain/repositories/saved_searches_repository.dart';
import '../../domain/use_cases/get_saved_searches_use_case.dart';
import '../../domain/use_cases/create_saved_search_use_case.dart';
import '../../domain/use_cases/delete_saved_search_use_case.dart';
import '../state/search_notifier.dart';
import '../state/search_state.dart';
import '../../../../core/api/dio_client.dart';

final searchRemoteDataSourceProvider = Provider((ref) {
  return SearchRemoteDataSource(DioClient.create());
});

final searchRepositoryProvider = Provider<SearchRepository>((ref) {
  return SearchRepositoryImpl(ref.read(searchRemoteDataSourceProvider));
});

final searchUseCaseProvider = Provider((ref) {
  return SearchUseCase(ref.read(searchRepositoryProvider));
});

final searchProvider = StateNotifierProvider<SearchNotifier, SearchState>((ref) {
  return SearchNotifier(ref.read(searchUseCaseProvider));
});

final savedSearchesRemoteDataSourceProvider = Provider((ref) {
  return SavedSearchesRemoteDataSource(DioClient.create());
});

final savedSearchesRepositoryProvider = Provider<SavedSearchesRepository>((ref) {
  return SavedSearchesRepositoryImpl(ref.read(savedSearchesRemoteDataSourceProvider));
});

final getSavedSearchesUseCaseProvider = Provider((ref) {
  return GetSavedSearchesUseCase(ref.read(savedSearchesRepositoryProvider));
});

final createSavedSearchUseCaseProvider = Provider((ref) {
  return CreateSavedSearchUseCase(ref.read(savedSearchesRepositoryProvider));
});

final deleteSavedSearchUseCaseProvider = Provider((ref) {
  return DeleteSavedSearchUseCase(ref.read(savedSearchesRepositoryProvider));
});
