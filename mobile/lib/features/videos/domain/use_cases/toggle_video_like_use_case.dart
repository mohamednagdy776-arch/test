import '../repositories/videos_repository.dart';

class ToggleVideoLikeUseCase {
  final VideosRepository _repository;
  const ToggleVideoLikeUseCase(this._repository);

  /// Returns the new liked state.
  Future<bool> call(String videoId, bool currentlyLiked) =>
      _repository.toggleLike(videoId, currentlyLiked);
}
