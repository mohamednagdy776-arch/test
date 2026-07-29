import '../entities/video.dart';
import '../repositories/videos_repository.dart';

class GetVideoUseCase {
  final VideosRepository _repository;
  const GetVideoUseCase(this._repository);

  Future<Video> call(String videoId) => _repository.getVideo(videoId);
}
