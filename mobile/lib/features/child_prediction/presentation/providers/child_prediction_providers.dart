import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/data_sources/child_prediction_remote_data_source.dart';
import '../../data/repositories/child_prediction_repository_impl.dart';
import '../../domain/repositories/child_prediction_repository.dart';
import '../../domain/use_cases/child_prediction_use_case.dart';
import '../state/child_prediction_notifier.dart';
import '../state/child_prediction_state.dart';
import '../../../../core/api/dio_client.dart';

final childPredictionRemoteDataSourceProvider = Provider((ref) {
  return ChildPredictionRemoteDataSource(DioClient.create());
});

final childPredictionRepositoryProvider = Provider<ChildPredictionRepository>((ref) {
  return ChildPredictionRepositoryImpl(ref.read(childPredictionRemoteDataSourceProvider));
});

final childPredictionUseCaseProvider = Provider((ref) {
  return ChildPredictionUseCase(ref.read(childPredictionRepositoryProvider));
});

final childPredictionProvider =
    StateNotifierProvider.autoDispose<ChildPredictionNotifier, ChildPredictionState>((ref) {
  return ChildPredictionNotifier(ref.read(childPredictionUseCaseProvider));
});
