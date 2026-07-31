import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/use_cases/child_prediction_use_case.dart';
import 'child_prediction_state.dart';

// Web cycles analyzing -> generating -> rendering on a fixed 20s/20s timer,
// advancing early only once the real response resolves (page.tsx's
// cycleStages). Mirrored here rather than trying to reflect real pipeline
// progress -- the backend gives no intermediate progress events, just one
// response after 3-4 minutes.
const _kStageStep = Duration(seconds: 20);

class ChildPredictionNotifier extends StateNotifier<ChildPredictionState> {
  final ChildPredictionUseCase _useCase;
  ChildPredictionNotifier(this._useCase) : super(const ChildPredictionState());

  Timer? _elapsedTimer;
  Timer? _stage1Timer;
  Timer? _stage2Timer;
  // Bumped on every predict()/cancel() call. A pending request's success/error
  // handler only applies to `state` if it's still the generation that
  // requested it -- guards against a cancelled or superseded call's response
  // arriving late and clobbering whatever the user moved on to (no real HTTP
  // abort is wired up; the server-side pipeline keeps running regardless of
  // client cancellation anyway, so this is the meaningful client-side
  // "cancel").
  int _generation = 0;

  void _clearTimers() {
    _elapsedTimer?.cancel();
    _stage1Timer?.cancel();
    _stage2Timer?.cancel();
    _elapsedTimer = null;
    _stage1Timer = null;
    _stage2Timer = null;
  }

  Future<void> predict({
    required List<int> parent1Bytes,
    required String parent1Filename,
    required List<int> parent2Bytes,
    required String parent2Filename,
  }) async {
    final myGeneration = ++_generation;
    _clearTimers();
    state = const ChildPredictionState(stage: ChildPredictionStage.analyzing, elapsedSeconds: 0);

    _elapsedTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (_generation != myGeneration) return;
      state = state.copyWith(elapsedSeconds: state.elapsedSeconds + 1);
    });
    _stage1Timer = Timer(_kStageStep, () {
      if (_generation != myGeneration) return;
      if (state.stage == ChildPredictionStage.analyzing) {
        state = state.copyWith(stage: ChildPredictionStage.generating);
      }
    });
    _stage2Timer = Timer(_kStageStep * 2, () {
      if (_generation != myGeneration) return;
      if (state.stage == ChildPredictionStage.generating) {
        state = state.copyWith(stage: ChildPredictionStage.rendering);
      }
    });

    try {
      final result = await _useCase.predict(
        parent1Bytes: parent1Bytes,
        parent1Filename: parent1Filename,
        parent2Bytes: parent2Bytes,
        parent2Filename: parent2Filename,
      );
      if (_generation != myGeneration) return; // superseded by cancel/reset/retry
      _clearTimers();
      state = state.copyWith(stage: ChildPredictionStage.done, result: result, error: null);
    } catch (e) {
      if (_generation != myGeneration) return;
      _clearTimers();
      state = state.copyWith(
        stage: ChildPredictionStage.error,
        error: _errorMessage(e),
        result: null,
      );
    }
  }

  // Validation failures (bad format / too-small image, #742) come back as a
  // plain NestJS BadRequestException body -- {message, error, statusCode} --
  // not the custom child-prediction success envelope, so they're read off
  // the DioException's response instead of the (unrelated) Dio-generated
  // exception message.
  String _errorMessage(Object e) {
    if (e is DioException) {
      final serverMessage = e.response?.data is Map
          ? (e.response?.data as Map)['message']
          : null;
      if (serverMessage is String && serverMessage.isNotEmpty) {
        if (serverMessage.contains('too small') ||
            serverMessage.contains('valid image') ||
            serverMessage.contains('JPEG')) {
          return 'يرجى رفع صورتين واضحتين بصيغة JPEG أو PNG أو WebP (١٠٠×١٠٠ بكسل على الأقل)';
        }
        if (e.response?.statusCode == 429) {
          return 'لقد تجاوزت الحد المسموح من المحاولات، حاول مجدداً بعد قليل';
        }
      }
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.sendTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        return 'استغرقت العملية وقتاً طويلاً، يرجى المحاولة مجدداً';
      }
    }
    return 'حدث خطأ، يرجى المحاولة مجدداً';
  }

  // Mirrors web's cancelPrediction() -- there's no server-side cancellation
  // (the pipeline keeps running either way), this just stops the client from
  // waiting on / reflecting a response the user no longer wants to see.
  void cancel() {
    _generation++;
    _clearTimers();
    state = state.copyWith(stage: ChildPredictionStage.error, error: 'تم الإلغاء', result: null);
  }

  void reset() {
    _generation++;
    _clearTimers();
    state = const ChildPredictionState();
  }

  @override
  void dispose() {
    _clearTimers();
    super.dispose();
  }
}
