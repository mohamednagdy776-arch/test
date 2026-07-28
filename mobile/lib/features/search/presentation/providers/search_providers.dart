import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/data_sources/search_remote_data_source.dart';
import '../../data/repositories/search_repository_impl.dart';
import '../../domain/repositories/search_repository.dart';
import '../../domain/use_cases/search_use_case.dart';
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
