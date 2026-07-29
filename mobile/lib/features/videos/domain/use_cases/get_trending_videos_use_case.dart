import '../../../../core/api/api_response.dart';
import '../entities/video.dart';
import '../repositories/videos_repository.dart';

class GetTrendingVideosUseCase {
  final VideosRepository _repository;
  const GetTrendingVideosUseCase(this._repository);

  Future<PaginatedResult<Video>> call({int page = 1, int limit = 20}) =>
      _repository.getTrending(page: page, limit: limit);
}
