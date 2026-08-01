import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/posts/domain/repositories/posts_repository.dart';
import 'package:tayyibt/features/posts/domain/use_cases/hide_post_use_case.dart';

class MockPostsRepository extends Mock implements PostsRepository {}

void main() {
  late MockPostsRepository repository;
  late HidePostUseCase useCase;

  setUp(() {
    repository = MockPostsRepository();
    useCase = HidePostUseCase(repository);
  });

  test('delegates to repository.hidePost with hideType only for "not interested"', () async {
    when(() => repository.hidePost('p1', hideType: 'not_interested', snoozeDays: null))
        .thenAnswer((_) async {});

    await useCase.call('p1', hideType: 'not_interested');

    verify(() => repository.hidePost('p1', hideType: 'not_interested', snoozeDays: null)).called(1);
  });

  test('forwards snoozeDays for a snooze', () async {
    when(() => repository.hidePost('p1', hideType: 'snooze', snoozeDays: 30)).thenAnswer((_) async {});

    await useCase.call('p1', hideType: 'snooze', snoozeDays: 30);

    verify(() => repository.hidePost('p1', hideType: 'snooze', snoozeDays: 30)).called(1);
  });

  test('propagates repository failures', () async {
    when(() => repository.hidePost(any(), hideType: any(named: 'hideType'), snoozeDays: any(named: 'snoozeDays')))
        .thenThrow(Exception('network error'));

    expect(() => useCase.call('p1', hideType: 'not_interested'), throwsException);
  });
}
