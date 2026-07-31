import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/child_prediction/domain/entities/child_prediction_result.dart';
import 'package:tayyibt/features/child_prediction/domain/repositories/child_prediction_repository.dart';
import 'package:tayyibt/features/child_prediction/domain/use_cases/child_prediction_use_case.dart';
import 'package:tayyibt/features/child_prediction/presentation/state/child_prediction_notifier.dart';
import 'package:tayyibt/features/child_prediction/presentation/state/child_prediction_state.dart';

class MockChildPredictionRepository extends Mock implements ChildPredictionRepository {}

void main() {
  late MockChildPredictionRepository repository;
  late ChildPredictionNotifier notifier;

  setUp(() {
    repository = MockChildPredictionRepository();
    notifier = ChildPredictionNotifier(ChildPredictionUseCase(repository));
  });

  tearDown(() {
    notifier.dispose();
  });

  test('starts idle', () {
    expect(notifier.state.stage, ChildPredictionStage.idle);
    expect(notifier.state.isLoading, isFalse);
  });

  test('predict moves to analyzing immediately, then done with the result on success', () async {
    when(() => repository.predict(
          parent1Bytes: any(named: 'parent1Bytes'),
          parent1Filename: any(named: 'parent1Filename'),
          parent2Bytes: any(named: 'parent2Bytes'),
          parent2Filename: any(named: 'parent2Filename'),
        )).thenAnswer((_) async => const ChildPredictionResult(
          imageBase64: 'AAAA',
          format: 'jpeg',
          mediaUrl: '/api/v1/media/predictions/x.jpg?t=abc',
        ));

    final future = notifier.predict(
      parent1Bytes: [1, 2, 3],
      parent1Filename: 'a.jpg',
      parent2Bytes: [4, 5, 6],
      parent2Filename: 'b.jpg',
    );
    expect(notifier.state.stage, ChildPredictionStage.analyzing);

    await future;

    expect(notifier.state.stage, ChildPredictionStage.done);
    expect(notifier.state.result?.imageBase64, 'AAAA');
    expect(notifier.state.error, isNull);
  });

  test('predict sets stage=error with the server message for a validation failure (#742)', () async {
    when(() => repository.predict(
          parent1Bytes: any(named: 'parent1Bytes'),
          parent1Filename: any(named: 'parent1Filename'),
          parent2Bytes: any(named: 'parent2Bytes'),
          parent2Filename: any(named: 'parent2Filename'),
        )).thenThrow(DioException(
      requestOptions: RequestOptions(path: '/features/child-prediction'),
      response: Response(
        requestOptions: RequestOptions(path: '/features/child-prediction'),
        statusCode: 400,
        data: {'message': 'First parent image is too small to be a face photo (min 100x100px)'},
      ),
      type: DioExceptionType.badResponse,
    ));

    await notifier.predict(
      parent1Bytes: [1],
      parent1Filename: 'a.jpg',
      parent2Bytes: [2],
      parent2Filename: 'b.jpg',
    );

    expect(notifier.state.stage, ChildPredictionStage.error);
    expect(notifier.state.error, contains('١٠٠×١٠٠'));
    expect(notifier.state.result, isNull);
  });

  test('predict sets a throttle-specific message on 429', () async {
    when(() => repository.predict(
          parent1Bytes: any(named: 'parent1Bytes'),
          parent1Filename: any(named: 'parent1Filename'),
          parent2Bytes: any(named: 'parent2Bytes'),
          parent2Filename: any(named: 'parent2Filename'),
        )).thenThrow(DioException(
      requestOptions: RequestOptions(path: '/features/child-prediction'),
      response: Response(
        requestOptions: RequestOptions(path: '/features/child-prediction'),
        statusCode: 429,
        data: {'message': 'ThrottlerException: Too Many Requests'},
      ),
      type: DioExceptionType.badResponse,
    ));

    await notifier.predict(
      parent1Bytes: [1],
      parent1Filename: 'a.jpg',
      parent2Bytes: [2],
      parent2Filename: 'b.jpg',
    );

    expect(notifier.state.stage, ChildPredictionStage.error);
    expect(notifier.state.error, contains('الحد المسموح'));
  });

  // Regression test for the stale-response footgun this notifier is built to
  // avoid: cancelling mid-flight must not let a later-resolving response
  // clobber the state the user already moved away from (no real HTTP abort
  // is wired up -- the server-side pipeline keeps running either way).
  test('cancel prevents a late-resolving response from overwriting state', () async {
    final completer = Completer<ChildPredictionResult>();
    when(() => repository.predict(
          parent1Bytes: any(named: 'parent1Bytes'),
          parent1Filename: any(named: 'parent1Filename'),
          parent2Bytes: any(named: 'parent2Bytes'),
          parent2Filename: any(named: 'parent2Filename'),
        )).thenAnswer((_) => completer.future);

    final predictFuture = notifier.predict(
      parent1Bytes: [1],
      parent1Filename: 'a.jpg',
      parent2Bytes: [2],
      parent2Filename: 'b.jpg',
    );
    expect(notifier.state.stage, ChildPredictionStage.analyzing);

    notifier.cancel();
    expect(notifier.state.stage, ChildPredictionStage.error);
    expect(notifier.state.error, 'تم الإلغاء');

    // The original request finally "resolves" after the cancel.
    completer.complete(const ChildPredictionResult(imageBase64: 'late', format: 'jpeg'));
    await predictFuture;

    // State must still reflect the cancellation, not the late result.
    expect(notifier.state.stage, ChildPredictionStage.error);
    expect(notifier.state.result, isNull);
  });

  test('reset returns to the initial idle state', () async {
    when(() => repository.predict(
          parent1Bytes: any(named: 'parent1Bytes'),
          parent1Filename: any(named: 'parent1Filename'),
          parent2Bytes: any(named: 'parent2Bytes'),
          parent2Filename: any(named: 'parent2Filename'),
        )).thenAnswer((_) async => const ChildPredictionResult(imageBase64: 'AAAA', format: 'jpeg'));

    await notifier.predict(
      parent1Bytes: [1],
      parent1Filename: 'a.jpg',
      parent2Bytes: [2],
      parent2Filename: 'b.jpg',
    );
    expect(notifier.state.stage, ChildPredictionStage.done);

    notifier.reset();

    expect(notifier.state.stage, ChildPredictionStage.idle);
    expect(notifier.state.result, isNull);
    expect(notifier.state.elapsedSeconds, 0);
  });
}
