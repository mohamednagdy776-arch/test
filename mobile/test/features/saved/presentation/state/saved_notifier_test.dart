import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/saved/domain/entities/saved_item.dart';
import 'package:tayyibt/features/saved/domain/repositories/saved_repository.dart';
import 'package:tayyibt/features/saved/domain/use_cases/get_saved_items_use_case.dart';
import 'package:tayyibt/features/saved/domain/use_cases/unsave_item_use_case.dart';
import 'package:tayyibt/features/saved/presentation/state/saved_notifier.dart';

class MockSavedRepository extends Mock implements SavedRepository {}

SavedItem _item(String id) {
  return SavedItem(
    id: id,
    entityType: 'post',
    entityId: 'post_$id',
    savedAt: DateTime(2026, 1, 1),
  );
}

void main() {
  late MockSavedRepository repository;
  late SavedNotifier notifier;

  setUp(() {
    repository = MockSavedRepository();
    notifier = SavedNotifier(
      GetSavedItemsUseCase(repository),
      UnsaveItemUseCase(repository),
    );
  });

  test('loadInitial populates items on success', () async {
    when(() => repository.getSaved()).thenAnswer((_) async => [_item('1')]);

    await notifier.loadInitial();

    expect(notifier.state.items.single.id, '1');
    expect(notifier.state.isLoading, isFalse);
    expect(notifier.state.error, isNull);
  });

  test('loadInitial sets an error when the repository throws', () async {
    when(() => repository.getSaved()).thenThrow(Exception('network error'));

    await notifier.loadInitial();

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.items, isEmpty);
  });

  test('unsave removes the item locally without a reload', () async {
    when(() => repository.getSaved()).thenAnswer((_) async => [_item('1'), _item('2')]);
    when(() => repository.unsave('1')).thenAnswer((_) async {});

    await notifier.loadInitial();
    await notifier.unsave('1');

    verify(() => repository.unsave('1')).called(1);
    expect(notifier.state.items.map((i) => i.id), ['2']);
  });
}
