import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/posts/domain/entities/post.dart';
import 'package:tayyibt/features/memories/domain/repositories/memories_repository.dart';
import 'package:tayyibt/features/memories/domain/use_cases/get_memories_use_case.dart';
import 'package:tayyibt/features/memories/presentation/state/memories_notifier.dart';

class MockMemoriesRepository extends Mock implements MemoriesRepository {}

Post _post(String id, DateTime createdAt) {
  return Post(id: id, userId: 'u1', content: 'memory $id', createdAt: createdAt, authorName: 'Amina');
}

void main() {
  late MockMemoriesRepository repository;
  late MemoriesNotifier notifier;

  setUp(() {
    repository = MockMemoriesRepository();
    notifier = MemoriesNotifier(GetMemoriesUseCase(repository));
  });

  test('loadInitial populates memories on success', () async {
    when(() => repository.getMemories()).thenAnswer((_) async => [_post('1', DateTime(2025, 1, 1))]);

    await notifier.loadInitial();

    expect(notifier.state.memories.single.id, '1');
    expect(notifier.state.isLoading, isFalse);
    expect(notifier.state.error, isNull);
  });

  test('loadInitial sets an error when the repository throws', () async {
    when(() => repository.getMemories()).thenThrow(Exception('network error'));

    await notifier.loadInitial();

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.memories, isEmpty);
  });
}
