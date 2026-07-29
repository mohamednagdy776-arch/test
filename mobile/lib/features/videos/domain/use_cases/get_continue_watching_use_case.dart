import '../../../../core/api/api_response.dart';
import '../entities/video.dart';
import '../repositories/videos_repository.dart';

class GetContinueWatchingUseCase {
  final VideosRepository _repository;
  const GetContinueWatchingUseCase(this._repository);

  Future<PaginatedResult<Video>> call({int page = 1, int limit = 20}) =>
      _repository.getContinueWatching(page: page, limit: limit);
}
