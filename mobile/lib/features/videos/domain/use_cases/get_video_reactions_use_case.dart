import '../entities/video.dart';
import '../repositories/videos_repository.dart';

class GetVideoReactionsUseCase {
  final VideosRepository _repository;
  const GetVideoReactionsUseCase(this._repository);

  Future<VideoReactions> call(String videoId) => _repository.getReactions(videoId);
}
