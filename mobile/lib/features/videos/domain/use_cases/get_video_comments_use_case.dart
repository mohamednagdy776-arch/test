import '../entities/video_comment.dart';
import '../repositories/videos_repository.dart';

class GetVideoCommentsUseCase {
  final VideosRepository _repository;
  const GetVideoCommentsUseCase(this._repository);

  Future<List<VideoComment>> call(String videoId) => _repository.getComments(videoId);
}
