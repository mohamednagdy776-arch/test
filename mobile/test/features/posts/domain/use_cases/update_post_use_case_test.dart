import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/posts/domain/entities/post.dart';
import 'package:tayyibt/features/posts/domain/repositories/posts_repository.dart';
import 'package:tayyibt/features/posts/domain/use_cases/update_post_use_case.dart';

class MockPostsRepository extends Mock implements PostsRepository {}

void main() {
  late MockPostsRepository repository;
  late UpdatePostUseCase useCase;

  setUp(() {
    repository = MockPostsRepository();
    useCase = UpdatePostUseCase(repository);
  });

  test('delegates to repository.updatePost with the given content', () async {
    final updated = Post(
      id: 'p1',
      userId: 'u1',
      content: 'edited',
      createdAt: DateTime(2026, 1, 1),
      authorName: 'Amina',
    );
    when(() => repository.updatePost('p1', content: 'edited')).thenAnswer((_) async => updated);

    final result = await useCase.call('p1', content: 'edited');

    expect(result.content, 'edited');
    verify(() => repository.updatePost('p1', content: 'edited')).called(1);
  });

  test('propagates repository failures', () async {
    when(() => repository.updatePost(any(), content: any(named: 'content')))
        .thenThrow(Exception('forbidden'));

    expect(() => useCase.call('p1', content: 'edited'), throwsException);
  });
}
