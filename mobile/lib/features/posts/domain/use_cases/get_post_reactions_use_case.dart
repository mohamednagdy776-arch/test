import '../entities/reaction_summary.dart';
import '../repositories/reactions_repository.dart';

class GetPostReactionsUseCase {
  final ReactionsRepository _repository;
  const GetPostReactionsUseCase(this._repository);

  Future<ReactionSummary> call(String postId) => _repository.getReactions(postId);
}
