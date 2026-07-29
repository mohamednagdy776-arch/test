import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/saved/domain/entities/saved_collection.dart';
import 'package:tayyibt/features/saved/domain/repositories/saved_repository.dart';
import 'package:tayyibt/features/saved/domain/use_cases/get_collections_use_case.dart';
import 'package:tayyibt/features/saved/domain/use_cases/create_collection_use_case.dart';
import 'package:tayyibt/features/saved/domain/use_cases/delete_collection_use_case.dart';
import 'package:tayyibt/features/saved/presentation/state/collections_notifier.dart';

class MockSavedRepository extends Mock implements SavedRepository {}

SavedCollection _collection(String id, String name) {
  return SavedCollection(id: id, name: name, createdAt: DateTime(2026, 1, 1));
}

void main() {
  late MockSavedRepository repository;
  late CollectionsNotifier notifier;

  setUp(() {
    repository = MockSavedRepository();
    notifier = CollectionsNotifier(
      GetCollectionsUseCase(repository),
      CreateCollectionUseCase(repository),
      DeleteCollectionUseCase(repository),
    );
  });

  test('loadInitial populates collections on success', () async {
    when(() => repository.getCollections()).thenAnswer((_) async => [_collection('1', 'Favorites')]);

    await notifier.loadInitial();

    expect(notifier.state.collections.single.name, 'Favorites');
    expect(notifier.state.isLoading, isFalse);
  });

  test('loadInitial sets an error when the repository throws', () async {
    when(() => repository.getCollections()).thenThrow(Exception('network error'));

    await notifier.loadInitial();

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.collections, isEmpty);
  });

  test('createCollection creates then reloads', () async {
    when(() => repository.createCollection('New', coverImage: any(named: 'coverImage')))
        .thenAnswer((_) async => _collection('1', 'New'));
    when(() => repository.getCollections()).thenAnswer((_) async => [_collection('1', 'New')]);

    await notifier.createCollection('New');

    expect(notifier.state.collections.single.name, 'New');
  });

  test('deleteCollection removes it locally without a reload', () async {
    when(() => repository.getCollections()).thenAnswer((_) async => [_collection('1', 'A'), _collection('2', 'B')]);
    when(() => repository.deleteCollection('1')).thenAnswer((_) async {});

    await notifier.loadInitial();
    await notifier.deleteCollection('1');

    verify(() => repository.deleteCollection('1')).called(1);
    expect(notifier.state.collections.map((c) => c.id), ['2']);
  });
}
