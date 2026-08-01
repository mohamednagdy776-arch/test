import '../entities/poll_voter.dart';
import '../repositories/posts_repository.dart';

// Owner-only -- the repository call 403s for anyone else.
class GetPollVotersUseCase {
  final PostsRepository _repository;
  const GetPollVotersUseCase(this._repository);

  Future<List<PollVoterOption>> call(String postId) => _repository.getPollVoters(postId);
}
