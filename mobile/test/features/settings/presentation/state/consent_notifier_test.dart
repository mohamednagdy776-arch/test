import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/profile/domain/entities/profile.dart';
import 'package:tayyibt/features/profile/domain/repositories/profile_repository.dart';
import 'package:tayyibt/features/profile/domain/use_cases/get_my_profile_use_case.dart';
import 'package:tayyibt/features/settings/domain/entities/consent_request.dart';
import 'package:tayyibt/features/settings/domain/repositories/settings_repository.dart';
import 'package:tayyibt/features/settings/domain/use_cases/consent_use_case.dart';
import 'package:tayyibt/features/settings/presentation/state/consent_notifier.dart';
import 'package:tayyibt/features/settings/presentation/state/consent_state.dart';

class MockSettingsRepository extends Mock implements SettingsRepository {}

class MockProfileRepository extends Mock implements ProfileRepository {}

const _me = Profile(id: 'p1', userId: 'me');

void main() {
  late MockSettingsRepository settingsRepository;
  late MockProfileRepository profileRepository;
  late ConsentNotifier notifier;

  setUp(() {
    settingsRepository = MockSettingsRepository();
    profileRepository = MockProfileRepository();
    notifier = ConsentNotifier(
      ConsentUseCase(settingsRepository),
      GetMyProfileUseCase(profileRepository),
    );
    when(() => profileRepository.getMyProfile()).thenAnswer((_) async => _me);
  });

  test('loadAll splits the flat consent list into incoming/outgoing using the current user id', () async {
    when(() => settingsRepository.getMyConsents('me')).thenAnswer((_) async => (
          incoming: const [
            ConsentRequestItem(id: 'c1', requesterUserId: 'other', targetUserId: 'me', consentType: 'medical_share', status: ConsentStatus.pending),
          ],
          outgoing: const [
            ConsentRequestItem(id: 'c2', requesterUserId: 'me', targetUserId: 'other', consentType: 'genetic_share', status: ConsentStatus.accepted),
          ],
        ));

    await notifier.loadAll();

    expect(notifier.state.incoming.single.id, 'c1');
    expect(notifier.state.outgoing.single.id, 'c2');
    expect(notifier.state.isLoading, isFalse);
  });

  test('loadAll sets an error when the repository throws', () async {
    when(() => settingsRepository.getMyConsents('me')).thenThrow(Exception('network error'));

    await notifier.loadAll();

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.isLoading, isFalse);
  });

  test('setTab switches the active tab without clearing a pre-existing error', () async {
    when(() => settingsRepository.getMyConsents('me')).thenThrow(Exception('boom'));
    await notifier.loadAll();
    expect(notifier.state.error, isNotNull);

    notifier.setTab(ConsentTab.outgoing);

    expect(notifier.state.tab, ConsentTab.outgoing);
    expect(notifier.state.error, isNotNull);
  });

  test('respond calls respondToConsent then reloads', () async {
    when(() => settingsRepository.respondToConsent('c1', true)).thenAnswer((_) async {});
    when(() => settingsRepository.getMyConsents('me')).thenAnswer((_) async => (
          incoming: const <ConsentRequestItem>[],
          outgoing: const <ConsentRequestItem>[],
        ));

    final ok = await notifier.respond('c1', true);

    expect(ok, isTrue);
    verifyInOrder([
      () => settingsRepository.respondToConsent('c1', true),
      () => settingsRepository.getMyConsents('me'),
    ]);
  });

  test('revoke returns false and sets an error on failure', () async {
    when(() => settingsRepository.revokeConsent('c2')).thenThrow(Exception('boom'));

    final ok = await notifier.revoke('c2');

    expect(ok, isFalse);
    expect(notifier.state.error, isNotNull);
  });
}
