import '../repositories/videos_repository.dart';

class DeleteVideoUseCase {
  final VideosRepository _repository;
  const DeleteVideoUseCase(this._repository);

  Future<void> call(String videoId) => _repository.deleteVideo(videoId);
}
