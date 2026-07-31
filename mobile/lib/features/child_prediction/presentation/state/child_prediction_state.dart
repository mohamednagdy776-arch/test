import '../../domain/entities/child_prediction_result.dart';

// Mirrors web/src/app/(main)/child-prediction/page.tsx's `Stage` type exactly
// (idle/analyzing/generating/rendering/done/error) so the "fusion chamber"
// staged-progress UI can be ported 1:1.
enum ChildPredictionStage { idle, analyzing, generating, rendering, done, error }

class ChildPredictionState {
  final ChildPredictionStage stage;
  final ChildPredictionResult? result;
  final String? error;
  final int elapsedSeconds;

  const ChildPredictionState({
    this.stage = ChildPredictionStage.idle,
    this.result,
    this.error,
    this.elapsedSeconds = 0,
  });

  bool get isLoading =>
      stage == ChildPredictionStage.analyzing ||
      stage == ChildPredictionStage.generating ||
      stage == ChildPredictionStage.rendering;

  // `result` and `error` are always directly assigned (same convention as
  // AffiliatesState/PremiumState) -- callers that mean to preserve the
  // current value must explicitly pass it back in, e.g. `result: state.result`.
  ChildPredictionState copyWith({
    ChildPredictionStage? stage,
    ChildPredictionResult? result,
    String? error,
    int? elapsedSeconds,
  }) {
    return ChildPredictionState(
      stage: stage ?? this.stage,
      result: result,
      error: error,
      elapsedSeconds: elapsedSeconds ?? this.elapsedSeconds,
    );
  }
}
