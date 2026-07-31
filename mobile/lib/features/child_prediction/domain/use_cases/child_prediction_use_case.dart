import '../entities/child_prediction_result.dart';
import '../repositories/child_prediction_repository.dart';

class ChildPredictionUseCase {
  final ChildPredictionRepository _repository;
  const ChildPredictionUseCase(this._repository);

  Future<ChildPredictionResult> predict({
    required List<int> parent1Bytes,
    required String parent1Filename,
    required List<int> parent2Bytes,
    required String parent2Filename,
  }) {
    return _repository.predict(
      parent1Bytes: parent1Bytes,
      parent1Filename: parent1Filename,
      parent2Bytes: parent2Bytes,
      parent2Filename: parent2Filename,
    );
  }
}
