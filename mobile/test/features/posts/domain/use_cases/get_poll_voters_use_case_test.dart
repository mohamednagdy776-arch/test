import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/posts/domain/entities/poll_voter.dart';
import 'package:tayyibt/features/posts/domain/repositories/posts_repository.dart';
import 'package:tayyibt/features/posts/domain/use_cases/get_poll_voters_use_case.dart';

class MockPostsRepository extends Mock implements PostsRepository {}

void main() {
  late MockPostsRepository repository;
  late GetPollVotersUseCase useCase;

  setUp(() {
    repository = MockPostsRepository();
    useCase = GetPollVotersUseCase(repository);
  });

  test('delegates to repository.getPollVoters and returns the per-option breakdown', () async {
    const voters = [
      PollVoterOption(text: 'A', votes: 1, voters: [PollVoter(id: 'u1', name: 'Amina')]),
      PollVoterOption(text: 'B', votes: 0, voters: []),
    ];
    when(() => repository.getPollVoters('p1')).thenAnswer((_) async => voters);

    final result = await useCase.call('p1');

    expect(result, hasLength(2));
    expect(result[0].voters.single.name, 'Amina');
  });

  // The backend 403s for anyone but the poll's own author -- the use case
  // just propagates that, same as any other repository failure.
  test('propagates a forbidden failure for a non-owner viewer', () async {
    when(() => repository.getPollVoters(any())).thenThrow(Exception('Only the poll creator can view voters'));

    expect(() => useCase.call('p1'), throwsException);
  });
}
