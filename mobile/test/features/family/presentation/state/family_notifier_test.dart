import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/family/domain/entities/family_relationship.dart';
import 'package:tayyibt/features/family/domain/repositories/family_repository.dart';
import 'package:tayyibt/features/family/domain/use_cases/family_use_case.dart';
import 'package:tayyibt/features/family/presentation/state/family_notifier.dart';

class MockFamilyRepository extends Mock implements FamilyRepository {}

FamilyRelationship _rel({
  String id = 'r1',
  String guardianUserId = 'guardian-1',
  String wardUserId = 'ward-1',
  String type = 'father',
  String status = 'pending',
}) =>
    FamilyRelationship(
      id: id,
      guardianUserId: guardianUserId,
      wardUserId: wardUserId,
      relationshipType: type,
      status: status,
    );

void main() {
  late MockFamilyRepository repository;
  late FamilyRelationshipsNotifier notifier;

  setUp(() {
    repository = MockFamilyRepository();
    notifier = FamilyRelationshipsNotifier(FamilyUseCase(repository));
  });

  test('loadInitial populates both guardians and wards (no data:null case on this controller)', () async {
    when(() => repository.getMyGuardians()).thenAnswer((_) async => [_rel(id: 'g1')]);
    when(() => repository.getMyWards()).thenAnswer((_) async => [_rel(id: 'w1', status: 'active')]);

    await notifier.loadInitial();

    expect(notifier.state.guardians.map((r) => r.id), ['g1']);
    expect(notifier.state.wards.map((r) => r.id), ['w1']);
    expect(notifier.state.isLoading, isFalse);
    expect(notifier.state.error, isNull);
  });

  test('loadInitial sets an error and does not throw when the repository fails', () async {
    when(() => repository.getMyGuardians()).thenThrow(Exception('network error'));
    when(() => repository.getMyWards()).thenAnswer((_) async => []);

    await notifier.loadInitial();

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.isLoading, isFalse);
  });

  test('invite sends the invitation and refreshes both lists on success', () async {
    when(() => repository.inviteGuardian(guardianUserId: 'g-2', type: 'father'))
        .thenAnswer((_) async => _rel(id: 'new'));
    when(() => repository.getMyGuardians()).thenAnswer((_) async => [_rel(id: 'new')]);
    when(() => repository.getMyWards()).thenAnswer((_) async => []);

    final ok = await notifier.invite(guardianUserId: 'g-2', type: 'father');

    expect(ok, isTrue);
    expect(notifier.state.isInviting, isFalse);
    expect(notifier.state.guardians.map((r) => r.id), ['new']);
  });

  test('invite surfaces the backend message on failure (e.g. inviting yourself, #-self-guardian)', () async {
    when(() => repository.inviteGuardian(guardianUserId: 'self', type: 'father'))
        .thenThrow(Exception('لا يمكنك تعيين نفسك ولي أمر لنفسك'));

    final ok = await notifier.invite(guardianUserId: 'self', type: 'father');

    expect(ok, isFalse);
    expect(notifier.state.isInviting, isFalse);
    expect(notifier.state.error, isNotNull);
  });

  test('accept resolves a pending ward invitation and refreshes state', () async {
    when(() => repository.acceptInvitation('w1')).thenAnswer((_) async => _rel(id: 'w1', status: 'active'));
    when(() => repository.getMyGuardians()).thenAnswer((_) async => []);
    when(() => repository.getMyWards()).thenAnswer((_) async => [_rel(id: 'w1', status: 'active')]);

    final ok = await notifier.accept('w1');

    expect(ok, isTrue);
    expect(notifier.state.wards.single.status, 'active');
  });

  // Same endpoint doubles as "reject" for a received invite and "cancel" for
  // a sent one -- the backend lets either ward or guardian revoke (#304).
  test('revoke succeeds and refreshes state', () async {
    when(() => repository.revokeRelationship('r1')).thenAnswer((_) async {});
    when(() => repository.getMyGuardians()).thenAnswer((_) async => []);
    when(() => repository.getMyWards()).thenAnswer((_) async => []);

    final ok = await notifier.revoke('r1');

    expect(ok, isTrue);
    expect(notifier.state.guardians, isEmpty);
    expect(notifier.state.wards, isEmpty);
  });

  test('revoke on a non-existent relationship sets an error and returns false', () async {
    when(() => repository.revokeRelationship('missing')).thenThrow(Exception('العلاقة غير موجودة'));

    final ok = await notifier.revoke('missing');

    expect(ok, isFalse);
    expect(notifier.state.error, isNotNull);
  });

  // Regression test for the known error-clobbering footgun: a prior catch
  // sets state.error, and a later successful action's copyWith must not
  // silently drop it by omitting `error:`.
  test('a later successful loadInitial clears a pre-existing error', () async {
    when(() => repository.getMyGuardians()).thenThrow(Exception('boom'));
    when(() => repository.getMyWards()).thenAnswer((_) async => []);
    await notifier.loadInitial();
    expect(notifier.state.error, isNotNull);

    when(() => repository.getMyGuardians()).thenAnswer((_) async => []);
    await notifier.loadInitial();

    expect(notifier.state.error, isNull);
  });
}
