import '../repositories/videos_repository.dart';

class DeleteVideoCommentUseCase {
  final VideosRepository _repository;
  const DeleteVideoCommentUseCase(this._repository);

  Future<void> call(String videoId, String commentId) =>
      _repository.deleteComment(videoId, commentId);
}
