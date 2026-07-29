import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/core/api/api_response.dart';
import 'package:tayyibt/features/interests/domain/entities/interest_row.dart';
import 'package:tayyibt/features/interests/domain/entities/person_summary.dart';
import 'package:tayyibt/features/interests/domain/entities/profile_view_row.dart';
import 'package:tayyibt/features/interests/domain/repositories/interests_repository.dart';
import 'package:tayyibt/features/interests/domain/use_cases/get_received_interests_use_case.dart';
import 'package:tayyibt/features/interests/domain/use_cases/get_sent_interests_use_case.dart';
import 'package:tayyibt/features/interests/domain/use_cases/get_profile_views_use_case.dart';
import 'package:tayyibt/features/interests/presentation/state/interests_notifier.dart';
import 'package:tayyibt/features/interests/presentation/state/interests_state.dart';

class MockInterestsRepository extends Mock implements InterestsRepository {}

const _user = PersonSummary(id: 'u1', fullName: 'Amina');

InterestRow _row(String id) {
  return InterestRow(id: id, status: 'pending', createdAt: DateTime(2026, 1, 1), user: _user);
}

void main() {
  late MockInterestsRepository repository;
  late InterestsNotifier notifier;

  setUp(() {
    repository = MockInterestsRepository();
    notifier = InterestsNotifier(
      GetReceivedInterestsUseCase(repository),
      GetSentInterestsUseCase(repository),
      GetProfileViewsUseCase(repository),
    );
  });

  test('loadInitial loads the received tab by default', () async {
    when(() => repository.getReceived()).thenAnswer((_) async => [_row('1')]);

    await notifier.loadInitial();

    expect(notifier.state.received.single.id, '1');
    expect(notifier.state.tab, InterestsTab.received);
    expect(notifier.state.isLoading, isFalse);
  });

  test('setTab(sent) loads the sent list', () async {
    when(() => repository.getSent()).thenAnswer((_) async => [_row('2')]);

    await notifier.setTab(InterestsTab.sent);

    expect(notifier.state.tab, InterestsTab.sent);
    expect(notifier.state.sent.single.id, '2');
  });

  test('setTab(views) loads profile views', () async {
    when(() => repository.getProfileViews()).thenAnswer((_) async => PaginatedResult(
          items: [ProfileViewRow(id: 'v1', viewedAt: DateTime(2026, 1, 1), user: _user)],
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        ));

    await notifier.setTab(InterestsTab.views);

    expect(notifier.state.views.single.id, 'v1');
  });

  test('loadInitial sets an error when the repository throws', () async {
    when(() => repository.getReceived()).thenThrow(Exception('network error'));

    await notifier.loadInitial();

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.received, isEmpty);
  });
}
