import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/affiliates/domain/entities/affiliate.dart';
import 'package:tayyibt/features/affiliates/domain/entities/affiliate_referral.dart';
import 'package:tayyibt/features/affiliates/domain/repositories/affiliates_repository.dart';
import 'package:tayyibt/features/affiliates/domain/use_cases/affiliates_use_case.dart';
import 'package:tayyibt/features/affiliates/presentation/state/affiliates_notifier.dart';

class MockAffiliatesRepository extends Mock implements AffiliatesRepository {}

Affiliate _affiliate({String id = '1', String code = 'ABCD1234'}) => Affiliate(
      id: id,
      referralCode: code,
      totalReferred: 2,
      totalMarriages: 0,
      commissionBalance: 15.5,
    );

AffiliateReferral _referral(String id) => AffiliateReferral(
      id: id,
      referralCodeUsed: 'ABCD1234',
      status: 'pending',
      conversionEvent: 'registration',
      commissionAmount: 0,
      createdAt: DateTime(2026, 1, 1),
    );

void main() {
  late MockAffiliatesRepository repository;
  late AffiliatesNotifier notifier;

  setUp(() {
    repository = MockAffiliatesRepository();
    notifier = AffiliatesNotifier(AffiliatesUseCase(repository));
  });

  test('loadInitial leaves affiliate null and skips fetching referrals when the user has not joined (data: null)', () async {
    when(() => repository.getMyAffiliate()).thenAnswer((_) async => null);

    await notifier.loadInitial();

    expect(notifier.state.affiliate, isNull);
    expect(notifier.state.referrals, isEmpty);
    expect(notifier.state.isLoading, isFalse);
    verifyNever(() => repository.getReferrals());
  });

  test('loadInitial populates affiliate and referrals when the user has joined', () async {
    when(() => repository.getMyAffiliate()).thenAnswer((_) async => _affiliate());
    when(() => repository.getReferrals()).thenAnswer((_) async => [_referral('r1')]);

    await notifier.loadInitial();

    expect(notifier.state.affiliate?.referralCode, 'ABCD1234');
    expect(notifier.state.referrals.map((r) => r.id), ['r1']);
  });

  test('loadInitial sets an error and does not throw when the repository fails', () async {
    when(() => repository.getMyAffiliate()).thenThrow(Exception('network error'));

    await notifier.loadInitial();

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.isLoading, isFalse);
  });

  test('join registers the user as an affiliate', () async {
    when(() => repository.joinAsAffiliate(referralCode: null)).thenAnswer((_) async => _affiliate());

    final ok = await notifier.join();

    expect(ok, isTrue);
    expect(notifier.state.affiliate?.referralCode, 'ABCD1234');
    expect(notifier.state.isJoining, isFalse);
  });

  test('join passes through a custom referral code', () async {
    when(() => repository.joinAsAffiliate(referralCode: 'CUSTOM99')).thenAnswer((_) async => _affiliate(code: 'CUSTOM99'));

    final ok = await notifier.join(referralCode: 'CUSTOM99');

    expect(ok, isTrue);
    expect(notifier.state.affiliate?.referralCode, 'CUSTOM99');
  });

  test('join returns false and sets an error on failure (e.g. already has an account)', () async {
    when(() => repository.joinAsAffiliate(referralCode: null)).thenThrow(Exception('409 Conflict'));

    final ok = await notifier.join();

    expect(ok, isFalse);
    expect(notifier.state.error, isNotNull);
    expect(notifier.state.isJoining, isFalse);
  });

  // Regression test for the known error-clobbering footgun: a prior catch
  // sets state.error, and a later successful action's copyWith must not
  // silently drop it by omitting `error:`.
  test('join on success clears a pre-existing error (explicitly re-passed)', () async {
    when(() => repository.joinAsAffiliate(referralCode: null)).thenThrow(Exception('boom'));
    await notifier.join();
    expect(notifier.state.error, isNotNull);

    when(() => repository.joinAsAffiliate(referralCode: 'X')).thenAnswer((_) async => _affiliate());
    await notifier.join(referralCode: 'X');

    expect(notifier.state.error, isNull);
    expect(notifier.state.affiliate, isNotNull);
  });
}
