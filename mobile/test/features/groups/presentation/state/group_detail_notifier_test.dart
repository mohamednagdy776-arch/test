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

  // ── Owner/admin-gated moderation actions (Phase 26) ──────────────────

  test('updateDetails saves then reloads the group on success', () async {
    when(() => repository.updateGroup('g1', name: 'New name', description: 'New desc')).thenAnswer(
      (_) async => const Group(id: 'g1', name: 'New name', description: 'New desc', privacy: 'public', memberCount: 1),
    );
    when(() => repository.getGroup('g1')).thenAnswer((_) async => const Group(
          id: 'g1',
          name: 'New name',
          description: 'New desc',
          privacy: 'public',
          memberCount: 1,
          isAdmin: true,
        ));

    final ok = await notifier.updateDetails(name: 'New name', description: 'New desc');

    expect(ok, isTrue);
    expect(notifier.state.group?.name, 'New name');
    expect(notifier.state.isSavingDetails, isFalse);
    expect(notifier.state.error, isNull);
  });

  test('updateDetails sets an error and does not clobber it on failure', () async {
    when(() => repository.updateGroup('g1', name: 'New name', description: null))
        .thenThrow(Exception('boom'));

    final ok = await notifier.updateDetails(name: 'New name');

    expect(ok, isFalse);
    expect(notifier.state.error, isNotNull);
    expect(notifier.state.isSavingDetails, isFalse);
    verifyNever(() => repository.getGroup(any()));
  });

  test('deleteGroup returns true on success', () async {
    when(() => repository.deleteGroup('g1')).thenAnswer((_) async {});

    final ok = await notifier.deleteGroup();

    expect(ok, isTrue);
    expect(notifier.state.isDeleting, isFalse);
    verify(() => repository.deleteGroup('g1')).called(1);
  });

  test('deleteGroup returns false and sets an error on failure (e.g. the live 403 for non-platform-admins)', () async {
    when(() => repository.deleteGroup('g1')).thenThrow(Exception('403 Forbidden'));

    final ok = await notifier.deleteGroup();

    expect(ok, isFalse);
    expect(notifier.state.error, isNotNull);
    expect(notifier.state.isDeleting, isFalse);
  });

  test('inviteMember invites then reloads members on success', () async {
    when(() => repository.inviteMember('g1', 'u2')).thenAnswer((_) async {});
    when(() => repository.getMembers('g1', page: 1, limit: 50)).thenAnswer(
      (_) async => const GroupMembersPage(
        items: [GroupMember(id: 'u2', fullName: 'Sara', role: 'member', status: 'active')],
        total: 1,
      ),
    );

    final ok = await notifier.inviteMember('u2');

    expect(ok, isTrue);
    expect(notifier.state.members.single.id, 'u2');
    expect(notifier.state.isInviting, isFalse);
  });

  test('inviteMember sets an error and leaves members unchanged on failure', () async {
    when(() => repository.inviteMember('g1', 'u2')).thenThrow(Exception('boom'));

    final ok = await notifier.inviteMember('u2');

    expect(ok, isFalse);
    expect(notifier.state.error, isNotNull);
    expect(notifier.state.members, isEmpty);
    verifyNever(() => repository.getMembers(any(), page: any(named: 'page'), limit: any(named: 'limit')));
  });

  test('banMember bans then reloads members on success', () async {
    when(() => repository.banMember('g1', 'u2')).thenAnswer((_) async {});
    when(() => repository.getMembers('g1', page: 1, limit: 50)).thenAnswer(
      (_) async => const GroupMembersPage(
        items: [GroupMember(id: 'u2', fullName: 'Sara', role: 'member', status: 'active', isBanned: true)],
        total: 1,
      ),
    );

    final ok = await notifier.banMember('u2');

    expect(ok, isTrue);
    expect(notifier.state.members.single.isBanned, isTrue);
    expect(notifier.state.isBanning, isFalse);
  });

  test('unbanMember unbans then reloads members on success', () async {
    when(() => repository.unbanMember('g1', 'u2')).thenAnswer((_) async {});
    when(() => repository.getMembers('g1', page: 1, limit: 50)).thenAnswer(
      (_) async => const GroupMembersPage(
        items: [GroupMember(id: 'u2', fullName: 'Sara', role: 'member', status: 'active', isBanned: false)],
        total: 1,
      ),
    );

    final ok = await notifier.unbanMember('u2');

    expect(ok, isTrue);
    expect(notifier.state.members.single.isBanned, isFalse);
    expect(notifier.state.isBanning, isFalse);
  });

  test('approveJoinRequest approves then reloads members on success', () async {
    when(() => repository.approveJoinRequest('g1', 'u2')).thenAnswer((_) async {});
    when(() => repository.getMembers('g1', page: 1, limit: 50)).thenAnswer(
      (_) async => const GroupMembersPage(
        items: [GroupMember(id: 'u2', fullName: 'Sara', role: 'member', status: 'active')],
        total: 1,
      ),
    );

    final ok = await notifier.approveJoinRequest('u2');

    expect(ok, isTrue);
    expect(notifier.state.members.single.status, 'active');
    expect(notifier.state.isApproving, isFalse);
  });

  test('rejectJoinRequest rejects then reloads members on success', () async {
    when(() => repository.rejectJoinRequest('g1', 'u2')).thenAnswer((_) async {});
    when(() => repository.getMembers('g1', page: 1, limit: 50)).thenAnswer(
      (_) async => const GroupMembersPage(items: [], total: 0),
    );

    final ok = await notifier.rejectJoinRequest('u2');

    expect(ok, isTrue);
    expect(notifier.state.members, isEmpty);
    expect(notifier.state.isRejecting, isFalse);
  });

  test('rejectJoinRequest sets an error on failure', () async {
    when(() => repository.rejectJoinRequest('g1', 'u2')).thenThrow(Exception('boom'));

    final ok = await notifier.rejectJoinRequest('u2');

    expect(ok, isFalse);
    expect(notifier.state.error, isNotNull);
    expect(notifier.state.isRejecting, isFalse);
  });
}
