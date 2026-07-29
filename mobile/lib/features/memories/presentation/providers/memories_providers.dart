import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/data_sources/memories_remote_data_source.dart';
import '../../data/repositories/memories_repository_impl.dart';
import '../../domain/repositories/memories_repository.dart';
import '../../domain/use_cases/get_memories_use_case.dart';
import '../state/memories_notifier.dart';
import '../state/memories_state.dart';
import '../../../../core/api/dio_client.dart';

final memoriesRemoteDataSourceProvider = Provider((ref) {
  return MemoriesRemoteDataSource(DioClient.create());
});

final memoriesRepositoryProvider = Provider<MemoriesRepository>((ref) {
  return MemoriesRepositoryImpl(ref.read(memoriesRemoteDataSourceProvider));
});

final getMemoriesUseCaseProvider = Provider((ref) {
  return GetMemoriesUseCase(ref.read(memoriesRepositoryProvider));
});

final memoriesProvider = StateNotifierProvider<MemoriesNotifier, MemoriesState>((ref) {
  return MemoriesNotifier(ref.read(getMemoriesUseCaseProvider));
});
