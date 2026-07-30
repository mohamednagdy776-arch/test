import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/settings/domain/entities/blocked_user.dart';
import 'package:tayyibt/features/settings/domain/entities/privacy_settings.dart';
import 'package:tayyibt/features/settings/domain/repositories/settings_repository.dart';
import 'package:tayyibt/features/settings/domain/use_cases/privacy_use_case.dart';
import 'package:tayyibt/features/settings/presentation/state/privacy_notifier.dart';

class MockSettingsRepository extends Mock implements SettingsRepository {}

void main() {
  late MockSettingsRepository repository;
  late PrivacyNotifier notifier;

  setUp(() {
    repository = MockSettingsRepository();
    notifier = PrivacyNotifier(PrivacyUseCase(repository));
  });

  test('loadAll populates settings, blocks and photo requests', () async {
    when(() => repository.getPrivacySettings()).thenAnswer((_) async => const PrivacySettings(whoCanSeePosts: 'public'));
    when(() => repository.getBlocks()).thenAnswer((_) async => const [
          BlockedUser(id: 'b1', blockedUserId: 'u1', name: 'Ali', username: 'ali'),
        ]);
    when(() => repository.getPhotoAccessRequests()).thenAnswer((_) async => const []);

    await notifier.loadAll();

    expect(notifier.state.settings.whoCanSeePosts, 'public');
    expect(notifier.state.blocks.single.blockedUserId, 'u1');
    expect(notifier.state.isLoading, isFalse);
  });

  test('loadAll sets an error when the repository throws', () async {
    when(() => repository.getPrivacySettings()).thenThrow(Exception('network error'));

    await notifier.loadAll();

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.isLoading, isFalse);
  });

  test('updateField updates settings in state on success', () async {
    when(() => repository.updatePrivacySettings({'whoCanSeePosts': 'only_me'}))
        .thenAnswer((_) async => const PrivacySettings(whoCanSeePosts: 'only_me'));

    final ok = await notifier.updateField('whoCanSeePosts', 'only_me');

    expect(ok, isTrue);
    expect(notifier.state.settings.whoCanSeePosts, 'only_me');
  });

  test('updateField returns false and sets an error on failure', () async {
    when(() => repository.updatePrivacySettings(any())).thenThrow(Exception('boom'));

    final ok = await notifier.updateField('whoCanSeePosts', 'public');

    expect(ok, isFalse);
    expect(notifier.state.error, isNotNull);
  });

  test('unblockUser removes the block from state on success (uses blockedUserId, not block id)', () async {
    when(() => repository.getPrivacySettings()).thenAnswer((_) async => const PrivacySettings());
    when(() => repository.getBlocks()).thenAnswer((_) async => const [
          BlockedUser(id: 'block-relation-id', blockedUserId: 'u1', name: 'Ali', username: 'ali'),
        ]);
    when(() => repository.getPhotoAccessRequests()).thenAnswer((_) async => const []);
    await notifier.loadAll();
    when(() => repository.unblockUser('u1')).thenAnswer((_) async {});

    final ok = await notifier.unblockUser('u1');

    expect(ok, isTrue);
    expect(notifier.state.blocks, isEmpty);
    verify(() => repository.unblockUser('u1')).called(1);
  });

  test('respondToPhotoRequest removes the request from state on success', () async {
    when(() => repository.getPrivacySettings()).thenAnswer((_) async => const PrivacySettings());
    when(() => repository.getBlocks()).thenAnswer((_) async => const []);
    when(() => repository.getPhotoAccessRequests())
        .thenAnswer((_) async => const [PhotoAccessRequest(id: 'r1', requesterName: 'Sara')]);
    await notifier.loadAll();
    when(() => repository.respondToPhotoAccessRequest('r1', true)).thenAnswer((_) async {});

    final ok = await notifier.respondToPhotoRequest('r1', true);

    expect(ok, isTrue);
    expect(notifier.state.photoRequests, isEmpty);
  });
}
