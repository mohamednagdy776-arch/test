import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/core/api/api_response.dart';
import 'package:tayyibt/features/groups/domain/entities/group.dart';
import 'package:tayyibt/features/groups/domain/entities/group_member.dart';
import 'package:tayyibt/features/groups/domain/repositories/groups_repository.dart';
import 'package:tayyibt/features/groups/domain/use_cases/group_detail_use_case.dart';
import 'package:tayyibt/features/groups/domain/use_cases/manage_group_use_case.dart';
import 'package:tayyibt/features/groups/domain/use_cases/group_posts_use_case.dart';
import 'package:tayyibt/features/groups/presentation/state/group_detail_notifier.dart';
import 'package:tayyibt/features/posts/domain/entities/post.dart';

class MockGroupsRepository extends Mock implements GroupsRepository {}

Group _group({bool isMember = false}) =>
    Group(id: 'g1', name: 'Test Group', privacy: 'public', memberCount: 1, isMember: isMember);

void main() {
  late MockGroupsRepository repository;
  late GroupDetailNotifier notifier;

  setUp(() {
    repository = MockGroupsRepository();
    notifier = GroupDetailNotifier(
      'g1',
      GroupDetailUseCase(repository),
      ManageGroupUseCase(repository),
      GroupPostsUseCase(repository),
    );
  });

  test('load populates group, members, and posts', () async {
    when(() => repository.getGroup('g1')).thenAnswer((_) async => _group());
    when(() => repository.getMembers('g1', page: 1, limit: 50)).thenAnswer(
      (_) async => const GroupMembersPage(items: [GroupMember(id: 'u1', fullName: 'Amina', role: 'admin', status: 'active')], total: 1),
    );
    when(() => repository.getGroupPosts('g1', page: 1, limit: 50)).thenAnswer(
      (_) async => const PaginatedResult(items: [], total: 0, page: 1, limit: 50, totalPages: 0),
    );

    await notifier.load();

    expect(notifier.state.group?.id, 'g1');
    expect(notifier.state.members.single.fullName, 'Amina');
    expect(notifier.state.isLoading, isFalse);
  });

  test('load sets an error when the repository throws', () async {
    when(() => repository.getGroup('g1')).thenThrow(Exception('not found'));

    await notifier.load();

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.group, isNull);
  });

  test('join reloads the group after a successful join', () async {
    when(() => repository.getGroup('g1')).thenAnswer((_) async => _group(isMember: true));
    when(() => repository.getMembers('g1', page: 1, limit: 50))
        .thenAnswer((_) async => const GroupMembersPage(items: [], total: 0));
    when(() => repository.getGroupPosts('g1', page: 1, limit: 50)).thenAnswer(
      (_) async => const PaginatedResult(items: [], total: 0, page: 1, limit: 50, totalPages: 0),
    );
    when(() => repository.joinGroup('g1')).thenAnswer((_) async => _group(isMember: true));

    await notifier.join();

    expect(notifier.state.group?.isMember, isTrue);
    expect(notifier.state.isJoining, isFalse);
    verify(() => repository.joinGroup('g1')).called(1);
  });

  test('createPost prepends the new post and ignores a blank submission', () async {
    when(() => repository.createGroupPost('g1', content: 'hello')).thenAnswer(
      (_) async => Post(id: 'p1', userId: 'u1', content: 'hello', createdAt: DateTime(2026, 1, 1), authorName: 'Amina'),
    );

    await notifier.createPost('   ');
    expect(notifier.state.posts, isEmpty);
    verifyNever(() => repository.createGroupPost(any(), content: any(named: 'content')));

    await notifier.createPost('hello');
    expect(notifier.state.posts.single.content, 'hello');
    expect(notifier.state.isPosting, isFalse);
  });
}
