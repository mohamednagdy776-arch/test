import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/settings/domain/entities/notification_settings.dart';
import 'package:tayyibt/features/settings/domain/repositories/settings_repository.dart';
import 'package:tayyibt/features/settings/domain/use_cases/notifications_settings_use_case.dart';
import 'package:tayyibt/features/settings/presentation/state/notifications_settings_notifier.dart';

class MockSettingsRepository extends Mock implements SettingsRepository {}

void main() {
  late MockSettingsRepository repository;
  late NotificationsSettingsNotifier notifier;

  setUp(() {
    repository = MockSettingsRepository();
    notifier = NotificationsSettingsNotifier(NotificationsSettingsUseCase(repository));
  });

  test('loadAll populates both notification and newsletter settings', () async {
    when(() => repository.getNotificationSettings())
        .thenAnswer((_) async => const NotificationSettings(notificationsEnabled: false));
    when(() => repository.getNewsletterSettings())
        .thenAnswer((_) async => const NewsletterSettings(weeklyDigest: false));

    await notifier.loadAll();

    expect(notifier.state.notificationSettings.notificationsEnabled, isFalse);
    expect(notifier.state.newsletterSettings.weeklyDigest, isFalse);
    expect(notifier.state.isLoading, isFalse);
  });

  test('loadAll sets an error when the repository throws', () async {
    when(() => repository.getNotificationSettings()).thenThrow(Exception('network error'));

    await notifier.loadAll();

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.isLoading, isFalse);
  });

  test('updateNotificationField updates notificationSettings on success', () async {
    when(() => repository.updateNotificationSettings({'likesNotifications': false}))
        .thenAnswer((_) async => const NotificationSettings(likesNotifications: false));

    final ok = await notifier.updateNotificationField('likesNotifications', false);

    expect(ok, isTrue);
    expect(notifier.state.notificationSettings.likesNotifications, isFalse);
  });

  test('updateNotificationField returns false and sets an error on failure', () async {
    when(() => repository.updateNotificationSettings(any())).thenThrow(Exception('boom'));

    final ok = await notifier.updateNotificationField('likesNotifications', false);

    expect(ok, isFalse);
    expect(notifier.state.error, isNotNull);
  });

  test('updateNewsletterField updates newsletterSettings on success', () async {
    when(() => repository.updateNewsletterSettings({'securityAlerts': false}))
        .thenAnswer((_) async => const NewsletterSettings(securityAlerts: false));

    final ok = await notifier.updateNewsletterField('securityAlerts', false);

    expect(ok, isTrue);
    expect(notifier.state.newsletterSettings.securityAlerts, isFalse);
  });
}
