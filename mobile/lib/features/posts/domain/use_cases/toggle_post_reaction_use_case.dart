import '../repositories/reactions_repository.dart';

class TogglePostReactionUseCase {
  final ReactionsRepository _repository;
  const TogglePostReactionUseCase(this._repository);

  /// Returns the new reaction type, or null if the toggle removed it.
  Future<String?> call(String postId, String type) => _repository.reactToPost(postId, type);
}
