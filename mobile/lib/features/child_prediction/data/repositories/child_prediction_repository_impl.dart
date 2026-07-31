import '../../domain/entities/child_prediction_result.dart';
import '../../domain/repositories/child_prediction_repository.dart';
import '../data_sources/child_prediction_remote_data_source.dart';

class ChildPredictionRepositoryImpl implements ChildPredictionRepository {
  final ChildPredictionRemoteDataSource _remoteDataSource;
  const ChildPredictionRepositoryImpl(this._remoteDataSource);

  @override
  Future<ChildPredictionResult> predict({
    required List<int> parent1Bytes,
    required String parent1Filename,
    required List<int> parent2Bytes,
    required String parent2Filename,
  }) {
    return _remoteDataSource.predict(
      parent1Bytes: parent1Bytes,
      parent1Filename: parent1Filename,
      parent2Bytes: parent2Bytes,
      parent2Filename: parent2Filename,
    );
  }
}
