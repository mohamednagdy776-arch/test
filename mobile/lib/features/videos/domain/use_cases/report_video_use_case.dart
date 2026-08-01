import '../repositories/videos_repository.dart';

class ReportVideoUseCase {
  final VideosRepository _repository;
  const ReportVideoUseCase(this._repository);

  Future<void> call(String videoId, String reason, {String? details}) =>
      _repository.reportVideo(videoId, reason, details: details);
}
