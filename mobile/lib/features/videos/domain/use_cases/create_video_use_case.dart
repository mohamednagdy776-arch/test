import '../entities/video.dart';
import '../repositories/videos_repository.dart';

class CreateVideoUseCase {
  final VideosRepository _repository;
  const CreateVideoUseCase(this._repository);

  Future<Video> call({
    required String title,
    String? description,
    required String url,
    String? thumbnail,
    int? duration,
    bool isReel = false,
  }) {
    return _repository.createVideo(
      title: title,
      description: description,
      url: url,
      thumbnail: thumbnail,
      duration: duration,
      isReel: isReel,
    );
  }
}
