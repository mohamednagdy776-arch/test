import '../entities/video_comment.dart';
import '../repositories/videos_repository.dart';

class UpdateVideoCommentUseCase {
  final VideosRepository _repository;
  const UpdateVideoCommentUseCase(this._repository);

  Future<VideoComment> call(String videoId, String commentId, String content) =>
      _repository.updateComment(videoId, commentId, content);
}
