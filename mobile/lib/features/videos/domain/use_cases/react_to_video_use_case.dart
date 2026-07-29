import '../repositories/videos_repository.dart';

class ReactToVideoUseCase {
  final VideosRepository _repository;
  const ReactToVideoUseCase(this._repository);

  /// Returns the new reaction type, or null if the toggle removed it.
  Future<String?> call(String videoId, String type) =>
      _repository.reactToVideo(videoId, type);
}
