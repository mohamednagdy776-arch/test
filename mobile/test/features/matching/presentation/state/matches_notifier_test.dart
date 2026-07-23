import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/core/api/api_response.dart';
import 'package:tayyibt/features/matching/domain/entities/match.dart';
import 'package:tayyibt/features/matching/domain/repositories/matching_repository.dart';
import 'package:tayyibt/features/matching/domain/use_cases/get_matches_use_case.dart';
import 'package:tayyibt/features/matching/domain/use_cases/generate_matches_use_case.dart';
import 'package:tayyibt/features/matching/domain/use_cases/respond_to_match_use_case.dart';
import 'package:tayyibt/features/matching/presentation/state/matches_notifier.dart';

class MockMatchingRepository extends Mock implements MatchingRepository {}

Match _match(String id, {String status = 'pending'}) {
  return Match(id: id, otherUserId: 'u-$id', score: 80, status: status, createdAt: DateTime(2026, 1, 1));
}

void main() {
  late MockMatchingRepository repository;
  late MatchesNotifier notifier;

  setUp(() {
    repository = MockMatchingRepository();
    notifier = MatchesNotifier(
      GetMatchesUseCase(repository),
      GenerateMatchesUseCase(repository),
      RespondToMatchUseCase(repository),
    );
  });

  test('load populates items for the requested status', () async {
    when(() => repository.getMatches(status: 'pending', page: 1, limit: 20)).thenAnswer(
      (_) async => PaginatedResult(items: [_match('1'), _match('2')], total: 2, page: 1, limit: 20, totalPages: 1),
    );

    await notifier.load(status: 'pending');

    expect(notifier.state.items.map((m) => m.id), ['1', '2']);
    expect(notifier.state.status, 'pending');
  });

  test('accept optimistically removes the match from the list', () async {
    when(() => repository.getMatches(status: 'pending', page: 1, limit: 20)).thenAnswer(
      (_) async => PaginatedResult(items: [_match('1'), _match('2')], total: 2, page: 1, limit: 20, totalPages: 1),
    );
    when(() => repository.acceptMatch('1')).thenAnswer((_) async {});

    await notifier.load(status: 'pending');
    await notifier.accept('1');

    expect(notifier.state.items.map((m) => m.id), ['2']);
    verify(() => repository.acceptMatch('1')).called(1);
  });

  test('reject restores the match on failure', () async {
    when(() => repository.getMatches(status: 'pending', page: 1, limit: 20)).thenAnswer(
      (_) async => PaginatedResult(items: [_match('1'), _match('2')], total: 2, page: 1, limit: 20, totalPages: 1),
    );
    when(() => repository.rejectMatch('1')).thenThrow(Exception('network error'));

    await notifier.load(status: 'pending');
    await notifier.reject('1');

    expect(notifier.state.items.map((m) => m.id), ['1', '2']);
    expect(notifier.state.error, isNotNull);
  });

  test('undoAccept and undoReject delegate to the matching use case', () async {
    when(() => repository.getMatches(status: 'accepted', page: 1, limit: 20)).thenAnswer(
      (_) async => PaginatedResult(items: [_match('1', status: 'accepted')], total: 1, page: 1, limit: 20, totalPages: 1),
    );
    when(() => repository.undoAccept('1')).thenAnswer((_) async {});

    await notifier.load(status: 'accepted');
    await notifier.undoAccept('1');

    expect(notifier.state.items, isEmpty);
    verify(() => repository.undoAccept('1')).called(1);
  });

  test('generate calls the generate endpoint then reloads the current status', () async {
    when(() => repository.generateMatches()).thenAnswer((_) async {});
    when(() => repository.getMatches(status: 'pending', page: 1, limit: 20)).thenAnswer(
      (_) async => PaginatedResult(items: [_match('1')], total: 1, page: 1, limit: 20, totalPages: 1),
    );

    await notifier.generate();

    verifyInOrder([
      () => repository.generateMatches(),
      () => repository.getMatches(status: 'pending', page: 1, limit: 20),
    ]);
    expect(notifier.state.items.map((m) => m.id), ['1']);
    expect(notifier.state.isGenerating, isFalse);
  });
}
