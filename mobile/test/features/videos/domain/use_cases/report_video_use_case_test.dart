import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/videos/domain/repositories/videos_repository.dart';
import 'package:tayyibt/features/videos/domain/use_cases/report_video_use_case.dart';

class MockVideosRepository extends Mock implements VideosRepository {}

void main() {
  late MockVideosRepository repository;
  late ReportVideoUseCase useCase;

  setUp(() {
    repository = MockVideosRepository();
    useCase = ReportVideoUseCase(repository);
  });

  test('delegates to repository.reportVideo with the reason and no details', () async {
    when(() => repository.reportVideo('v1', 'inappropriate', details: null)).thenAnswer((_) async {});

    await useCase.call('v1', 'inappropriate');

    verify(() => repository.reportVideo('v1', 'inappropriate', details: null)).called(1);
  });

  test('forwards optional details', () async {
    when(() => repository.reportVideo('v1', 'other', details: 'custom reason'))
        .thenAnswer((_) async {});

    await useCase.call('v1', 'other', details: 'custom reason');

    verify(() => repository.reportVideo('v1', 'other', details: 'custom reason')).called(1);
  });

  test('propagates repository failures', () async {
    when(() => repository.reportVideo(any(), any(), details: any(named: 'details')))
        .thenThrow(Exception('network error'));

    expect(() => useCase.call('v1', 'scam'), throwsException);
  });
}
