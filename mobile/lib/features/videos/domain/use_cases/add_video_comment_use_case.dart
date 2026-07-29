import '../entities/video_comment.dart';
import '../repositories/videos_repository.dart';

class AddVideoCommentUseCase {
  final VideosRepository _repository;
  const AddVideoCommentUseCase(this._repository);

  Future<VideoComment> call(String videoId, String content) =>
      _repository.addComment(videoId, content);
}
