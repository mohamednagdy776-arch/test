import '../entities/child_prediction_result.dart';

abstract class ChildPredictionRepository {
  // Exactly two parent face photos, raw bytes (XFile.path isn't a real
  // filesystem path on web/some platforms -- same reasoning as
  // ProfileRemoteDataSource.uploadAvatar). This is a 3-4 minute synchronous
  // pipeline server-side (backend/src/features/child-prediction.controller.ts
  // comment + confirmed live: ~3m46s round trip for a 200x200 test image), so
  // the data-source layer applies a long per-request timeout rather than the
  // app's normal short default.
  Future<ChildPredictionResult> predict({
    required List<int> parent1Bytes,
    required String parent1Filename,
    required List<int> parent2Bytes,
    required String parent2Filename,
  });
}
