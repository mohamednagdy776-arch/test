import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/settings/domain/entities/appearance_settings.dart';
import 'package:tayyibt/features/settings/domain/repositories/settings_repository.dart';
import 'package:tayyibt/features/settings/domain/use_cases/appearance_use_case.dart';
import 'package:tayyibt/features/settings/presentation/state/appearance_notifier.dart';

class MockSettingsRepository extends Mock implements SettingsRepository {}

void main() {
  late MockSettingsRepository repository;
  late AppearanceNotifier notifier;

  setUp(() {
    repository = MockSettingsRepository();
    notifier = AppearanceNotifier(AppearanceUseCase(repository));
  });

  test('load populates settings', () async {
    when(() => repository.getAppearanceSettings())
        .thenAnswer((_) async => const AppearanceSettings(reducedMotion: true));

    await notifier.load();

    expect(notifier.state.settings.reducedMotion, isTrue);
    expect(notifier.state.isLoading, isFalse);
  });

  test('load sets an error when the repository throws', () async {
    when(() => repository.getAppearanceSettings()).thenThrow(Exception('network error'));

    await notifier.load();

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.isLoading, isFalse);
  });

  test('setReducedMotion updates local state without saving', () {
    notifier.setReducedMotion(true);

    expect(notifier.state.settings.reducedMotion, isTrue);
    verifyNever(() => repository.updateAppearanceSettings(any()));
  });

  test('save persists the current local toggle values', () async {
    notifier.setHighContrast(true);
    when(() => repository.updateAppearanceSettings({
          'reducedMotion': false,
          'highContrast': true,
          'largeText': false,
        })).thenAnswer((_) async => const AppearanceSettings(highContrast: true));

    final ok = await notifier.save();

    expect(ok, isTrue);
    expect(notifier.state.isSaving, isFalse);
    expect(notifier.state.settings.highContrast, isTrue);
  });

  test('save returns false and sets an error on failure', () async {
    when(() => repository.updateAppearanceSettings(any())).thenThrow(Exception('boom'));

    final ok = await notifier.save();

    expect(ok, isFalse);
    expect(notifier.state.error, isNotNull);
    expect(notifier.state.isSaving, isFalse);
  });
}
