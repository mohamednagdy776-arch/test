import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/lab_portal/domain/entities/lab.dart';
import 'package:tayyibt/features/lab_portal/domain/entities/lab_referral_code.dart';
import 'package:tayyibt/features/lab_portal/domain/repositories/lab_portal_repository.dart';
import 'package:tayyibt/features/lab_portal/domain/use_cases/lab_portal_use_case.dart';
import 'package:tayyibt/features/lab_portal/presentation/state/lab_portal_notifier.dart';

class MockLabPortalRepository extends Mock implements LabPortalRepository {}

Lab _lab({String id = 'lab-1', String name = 'Lab One'}) =>
    Lab(id: id, name: name, commercialRegistration: '123456', status: 'active');

LabReferralCode _code({String id = 'c1', String labId = 'lab-1', String code = 'ABCD1234', DateTime? expiresAt, DateTime? usedAt}) =>
    LabReferralCode(
      id: id,
      labId: labId,
      code: code,
      expiresAt: expiresAt ?? DateTime.now().add(const Duration(days: 30)),
      usedAt: usedAt,
    );

void main() {
  late MockLabPortalRepository repository;
  late LabPortalNotifier notifier;

  setUp(() {
    repository = MockLabPortalRepository();
    notifier = LabPortalNotifier(LabPortalUseCase(repository));
  });

  test('loadInitial populates labs and referrals', () async {
    when(() => repository.getActiveLabs()).thenAnswer((_) async => [_lab()]);
    when(() => repository.getMyReferrals()).thenAnswer((_) async => [_code()]);

    await notifier.loadInitial();

    expect(notifier.state.labs.map((l) => l.id), ['lab-1']);
    expect(notifier.state.referrals.map((c) => c.id), ['c1']);
    expect(notifier.state.isLoading, isFalse);
  });

  test('loadInitial sets an error and does not throw when the repository fails', () async {
    when(() => repository.getActiveLabs()).thenThrow(Exception('network error'));

    await notifier.loadInitial();

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.isLoading, isFalse);
  });

  test('generateCode returns the new code and refreshes the referral list', () async {
    when(() => repository.generateReferralCode('lab-1')).thenAnswer((_) async => _code(id: 'new'));
    when(() => repository.getMyReferrals()).thenAnswer((_) async => [_code(id: 'new')]);

    final code = await notifier.generateCode('lab-1');

    expect(code?.id, 'new');
    expect(notifier.state.referrals.map((c) => c.id), ['new']);
    expect(notifier.state.generatingLabId, isNull);
  });

  test('generateCode returns null and sets an error on failure', () async {
    when(() => repository.generateReferralCode('lab-1')).thenThrow(Exception('missing labId'));

    final code = await notifier.generateCode('lab-1');

    expect(code, isNull);
    expect(notifier.state.error, isNotNull);
    expect(notifier.state.generatingLabId, isNull);
  });

  test('LabReferralCode status helpers classify used/expired/active correctly', () {
    final used = _code(usedAt: DateTime.now());
    final expired = _code(expiresAt: DateTime.now().subtract(const Duration(days: 1)));
    final active = _code();

    expect(used.isUsed, isTrue);
    expect(used.isActive, isFalse);
    expect(expired.isExpired, isTrue);
    expect(expired.isActive, isFalse);
    expect(active.isActive, isTrue);
  });
}
