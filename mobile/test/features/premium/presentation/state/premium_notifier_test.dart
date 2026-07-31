import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/premium/domain/entities/subscription.dart';
import 'package:tayyibt/features/premium/domain/repositories/premium_repository.dart';
import 'package:tayyibt/features/premium/domain/use_cases/premium_use_case.dart';
import 'package:tayyibt/features/premium/presentation/state/premium_notifier.dart';

class MockPremiumRepository extends Mock implements PremiumRepository {}

Subscription _sub(String id, {String plan = 'premium', String status = 'active'}) => Subscription(
      id: id,
      plan: plan,
      startDate: DateTime(2026, 1, 1),
      endDate: DateTime(2026, 2, 1),
      status: status,
    );

void main() {
  late MockPremiumRepository repository;
  late PremiumNotifier notifier;

  setUp(() {
    repository = MockPremiumRepository();
    notifier = PremiumNotifier(PremiumUseCase(repository));
  });

  test('loadInitial populates active and history', () async {
    when(() => repository.getActiveSubscription()).thenAnswer((_) async => _sub('1'));
    when(() => repository.getMySubscriptions()).thenAnswer((_) async => [_sub('1')]);

    await notifier.loadInitial();

    expect(notifier.state.active?.id, '1');
    expect(notifier.state.history.map((s) => s.id), ['1']);
    expect(notifier.state.activePlan, 'premium');
    expect(notifier.state.isLoading, isFalse);
    expect(notifier.state.error, isNull);
  });

  test('loadInitial leaves active null when there is no active subscription (data: null)', () async {
    when(() => repository.getActiveSubscription()).thenAnswer((_) async => null);
    when(() => repository.getMySubscriptions()).thenAnswer((_) async => []);

    await notifier.loadInitial();

    expect(notifier.state.active, isNull);
    expect(notifier.state.activePlan, 'free');
  });

  test('loadInitial sets an error and does not throw when the repository fails', () async {
    when(() => repository.getActiveSubscription()).thenThrow(Exception('network error'));

    await notifier.loadInitial();

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.isLoading, isFalse);
  });

  test('subscribe creates a subscription and sets it as active', () async {
    when(() => repository.createSubscription('premium')).thenAnswer((_) async => _sub('2'));

    final result = await notifier.subscribe('premium');

    expect(result?.id, '2');
    expect(notifier.state.active?.id, '2');
    expect(notifier.state.history.map((s) => s.id), ['2']);
    expect(notifier.state.isMutating, isFalse);
  });

  test('subscribe returns null and sets an error on failure', () async {
    when(() => repository.createSubscription('family')).thenThrow(Exception('boom'));

    final result = await notifier.subscribe('family');

    expect(result, isNull);
    expect(notifier.state.error, isNotNull);
    expect(notifier.state.isMutating, isFalse);
  });

  // Regression test for the known error-clobbering footgun: a prior catch
  // sets state.error, and a later successful action's copyWith must not
  // silently drop it by omitting `error:`.
  test('subscribe on success clears a pre-existing error (explicitly re-passed)', () async {
    when(() => repository.createSubscription('bad')).thenThrow(Exception('boom'));
    await notifier.subscribe('bad');
    expect(notifier.state.error, isNotNull);

    when(() => repository.createSubscription('premium')).thenAnswer((_) async => _sub('3'));
    await notifier.subscribe('premium');

    expect(notifier.state.error, isNull);
    expect(notifier.state.active?.id, '3');
  });

  test('cancel updates the subscription status and updates history in place', () async {
    when(() => repository.getActiveSubscription()).thenAnswer((_) async => _sub('1'));
    when(() => repository.getMySubscriptions()).thenAnswer((_) async => [_sub('1')]);
    await notifier.loadInitial();

    when(() => repository.cancelSubscription('1')).thenAnswer((_) async => _sub('1', status: 'cancelled'));

    final ok = await notifier.cancel('1');

    expect(ok, isTrue);
    expect(notifier.state.active?.status, 'cancelled');
    expect(notifier.state.activePlan, 'free');
    expect(notifier.state.history.single.status, 'cancelled');
  });

  test('cancel returns false and sets an error on failure', () async {
    when(() => repository.cancelSubscription('missing')).thenThrow(Exception('boom'));

    final ok = await notifier.cancel('missing');

    expect(ok, isFalse);
    expect(notifier.state.error, isNotNull);
  });
}
