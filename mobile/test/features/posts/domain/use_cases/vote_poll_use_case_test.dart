import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/posts/domain/entities/poll_option.dart';
import 'package:tayyibt/features/posts/domain/repositories/posts_repository.dart';
import 'package:tayyibt/features/posts/domain/use_cases/vote_poll_use_case.dart';

class MockPostsRepository extends Mock implements PostsRepository {}

void main() {
  late MockPostsRepository repository;
  late VotePollUseCase useCase;

  setUp(() {
    repository = MockPostsRepository();
    useCase = VotePollUseCase(repository);
  });

  test('delegates to repository.votePoll and returns its result', () async {
    const result = PollVoteResult(
      pollOptions: [PollOption(text: 'A', votes: 1), PollOption(text: 'B', votes: 0)],
      myVote: 0,
    );
    when(() => repository.votePoll('p1', 0)).thenAnswer((_) async => result);

    final actual = await useCase.call('p1', 0);

    expect(actual.myVote, 0);
    expect(actual.pollOptions[0].votes, 1);
    verify(() => repository.votePoll('p1', 0)).called(1);
  });

  test('propagates repository failures', () async {
    when(() => repository.votePoll(any(), any())).thenThrow(Exception('network error'));

    expect(() => useCase.call('p1', 0), throwsException);
  });
}
