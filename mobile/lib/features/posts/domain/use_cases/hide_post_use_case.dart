import '../repositories/posts_repository.dart';

class HidePostUseCase {
  final PostsRepository _repository;
  const HidePostUseCase(this._repository);

  Future<void> call(String postId, {required String hideType, int? snoozeDays}) =>
      _repository.hidePost(postId, hideType: hideType, snoozeDays: snoozeDays);
}
