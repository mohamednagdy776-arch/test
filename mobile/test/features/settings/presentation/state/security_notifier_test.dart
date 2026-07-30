import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/settings/domain/entities/session.dart';
import 'package:tayyibt/features/settings/domain/repositories/settings_repository.dart';
import 'package:tayyibt/features/settings/domain/use_cases/security_use_case.dart';
import 'package:tayyibt/features/settings/presentation/state/security_notifier.dart';

class MockSettingsRepository extends Mock implements SettingsRepository {}

UserSession _session(String id) => UserSession(
      id: id,
      deviceName: 'Device $id',
      browser: 'Chrome',
      ipAddress: '1.2.3.4',
      lastActive: '2026-01-01T00:00:00.000Z',
    );

void main() {
  late MockSettingsRepository repository;
  late SecurityNotifier notifier;

  setUp(() {
    repository = MockSettingsRepository();
    notifier = SecurityNotifier(SecurityUseCase(repository));
  });

  test('loadAll populates sessions and twoFactorEnabled', () async {
    when(() => repository.getSessions()).thenAnswer((_) async => [_session('1'), _session('2')]);
    when(() => repository.getTwoFactorEnabled()).thenAnswer((_) async => true);

    await notifier.loadAll();

    expect(notifier.state.sessions.map((s) => s.id), ['1', '2']);
    expect(notifier.state.twoFactorEnabled, isTrue);
    expect(notifier.state.isLoading, isFalse);
    expect(notifier.state.error, isNull);
  });

  test('loadAll sets an error and does not throw when the repository fails', () async {
    when(() => repository.getSessions()).thenThrow(Exception('network error'));

    await notifier.loadAll();

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.isLoading, isFalse);
  });

  test('revokeSession removes the session from state on success', () async {
    when(() => repository.getSessions()).thenAnswer((_) async => [_session('1'), _session('2')]);
    when(() => repository.getTwoFactorEnabled()).thenAnswer((_) async => false);
    await notifier.loadAll();
    when(() => repository.revokeSession('1')).thenAnswer((_) async {});

    final ok = await notifier.revokeSession('1');

    expect(ok, isTrue);
    expect(notifier.state.sessions.map((s) => s.id), ['2']);
  });

  test('revokeSession returns false and sets an error on failure', () async {
    when(() => repository.revokeSession('1')).thenThrow(Exception('boom'));

    final ok = await notifier.revokeSession('1');

    expect(ok, isFalse);
    expect(notifier.state.error, isNotNull);
  });

  // Regression test for the known error-clobbering footgun: a prior catch
  // sets state.error, and a later successful action's copyWith must not
  // silently drop it by omitting `error:` -- verify2FA explicitly re-passes
  // state.error on success.
  test('verify2FA preserves a pre-existing error on success (no silent clobber)', () async {
    when(() => repository.revokeSession('missing')).thenThrow(Exception('boom'));
    await notifier.revokeSession('missing');
    expect(notifier.state.error, isNotNull);

    when(() => repository.verify2FA('123456')).thenAnswer((_) async {});
    final ok = await notifier.verify2FA('123456');

    expect(ok, isTrue);
    expect(notifier.state.twoFactorEnabled, isTrue);
    expect(notifier.state.error, isNotNull);
  });

  test('verify2FA sets twoFactorEnabled true on success', () async {
    when(() => repository.verify2FA('123456')).thenAnswer((_) async {});

    final ok = await notifier.verify2FA('123456');

    expect(ok, isTrue);
    expect(notifier.state.twoFactorEnabled, isTrue);
  });

  test('disable2FA sets twoFactorEnabled false on success', () async {
    when(() => repository.disable2FA('123456')).thenAnswer((_) async {});

    final ok = await notifier.disable2FA('123456');

    expect(ok, isTrue);
    expect(notifier.state.twoFactorEnabled, isFalse);
  });

  test('disable2FA returns false on failure', () async {
    when(() => repository.disable2FA('000000')).thenThrow(Exception('bad code'));

    final ok = await notifier.disable2FA('000000');

    expect(ok, isFalse);
    expect(notifier.state.error, isNotNull);
  });

  test('changePassword returns null on success', () async {
    when(() => repository.changePassword('old', 'New1234!')).thenAnswer((_) async {});

    final result = await notifier.changePassword('old', 'New1234!');

    expect(result, isNull);
  });

  test('changePassword returns an error message on failure', () async {
    when(() => repository.changePassword('wrong', 'New1234!')).thenThrow(Exception('boom'));

    final result = await notifier.changePassword('wrong', 'New1234!');

    expect(result, isNotNull);
  });

  test('deleteAccount returns null on success', () async {
    when(() => repository.deleteAccount('pw')).thenAnswer((_) async {});

    final result = await notifier.deleteAccount('pw');

    expect(result, isNull);
  });

  test('revokeAllOtherSessions reloads sessions after revoking', () async {
    when(() => repository.revokeAllSessions()).thenAnswer((_) async {});
    when(() => repository.getSessions()).thenAnswer((_) async => [_session('1')]);
    when(() => repository.getTwoFactorEnabled()).thenAnswer((_) async => false);

    final ok = await notifier.revokeAllOtherSessions();

    expect(ok, isTrue);
    expect(notifier.state.sessions.map((s) => s.id), ['1']);
  });
}
