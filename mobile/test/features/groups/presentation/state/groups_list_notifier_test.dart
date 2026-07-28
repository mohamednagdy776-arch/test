import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/core/api/api_response.dart';
import 'package:tayyibt/features/groups/domain/entities/group.dart';
import 'package:tayyibt/features/groups/domain/repositories/groups_repository.dart';
import 'package:tayyibt/features/groups/domain/use_cases/get_groups_use_case.dart';
import 'package:tayyibt/features/groups/domain/use_cases/manage_group_use_case.dart';
import 'package:tayyibt/features/groups/presentation/state/groups_list_notifier.dart';

class MockGroupsRepository extends Mock implements GroupsRepository {}

Group _group(String id, {int memberCount = 1}) =>
    Group(id: id, name: 'Group $id', privacy: 'public', memberCount: memberCount);

void main() {
  late MockGroupsRepository repository;
  late GroupsListNotifier notifier;

  setUp(() {
    repository = MockGroupsRepository();
    notifier = GroupsListNotifier(GetGroupsUseCase(repository), ManageGroupUseCase(repository));
  });

  test('loadAll populates my/public/suggested lists', () async {
    when(() => repository.getMyGroups()).thenAnswer((_) async => [_group('1')]);
    when(() => repository.getPublicGroups(page: 1, limit: 20, category: null)).thenAnswer(
      (_) async => PaginatedResult(items: [_group('2'), _group('3')], total: 2, page: 1, limit: 20, totalPages: 1),
    );
    when(() => repository.getSuggestedGroups(limit: 5)).thenAnswer((_) async => [_group('4')]);

    await notifier.loadAll();

    expect(notifier.state.myGroups.map((g) => g.id), ['1']);
    expect(notifier.state.publicGroups.map((g) => g.id), ['2', '3']);
    expect(notifier.state.suggested.map((g) => g.id), ['4']);
    expect(notifier.state.isLoading, isFalse);
  });

  test('loadAll sets an error when the repository throws', () async {
    when(() => repository.getMyGroups()).thenThrow(Exception('network error'));

    await notifier.loadAll();

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.isLoading, isFalse);
  });

  test('join calls the repository then reloads the lists', () async {
    when(() => repository.getMyGroups()).thenAnswer((_) async => [_group('1')]);
    when(() => repository.getPublicGroups(page: 1, limit: 20, category: null)).thenAnswer(
      (_) async => const PaginatedResult(items: [], total: 0, page: 1, limit: 20, totalPages: 0),
    );
    when(() => repository.getSuggestedGroups(limit: 5)).thenAnswer((_) async => []);
    when(() => repository.joinGroup('g1')).thenAnswer((_) async => _group('g1'));

    await notifier.join('g1');

    verifyInOrder([
      () => repository.joinGroup('g1'),
      () => repository.getMyGroups(),
    ]);
    expect(notifier.state.pendingIds, isEmpty);
  });

  test('create returns false and sets an error on failure', () async {
    when(() => repository.createGroup(name: 'x', description: null, privacy: 'public', category: null))
        .thenThrow(Exception('boom'));

    final ok = await notifier.create(name: 'x');

    expect(ok, isFalse);
    expect(notifier.state.error, isNotNull);
  });
}
