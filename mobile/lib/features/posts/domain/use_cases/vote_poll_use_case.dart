import '../entities/poll_option.dart';
import '../repositories/posts_repository.dart';

class VotePollUseCase {
  final PostsRepository _repository;
  const VotePollUseCase(this._repository);

  Future<PollVoteResult> call(String postId, int optionIndex) =>
      _repository.votePoll(postId, optionIndex);
}
