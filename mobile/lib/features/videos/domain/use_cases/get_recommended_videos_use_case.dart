import '../../../../core/api/api_response.dart';
import '../entities/video.dart';
import '../repositories/videos_repository.dart';

class GetRecommendedVideosUseCase {
  final VideosRepository _repository;
  const GetRecommendedVideosUseCase(this._repository);

  Future<PaginatedResult<Video>> call({int page = 1, int limit = 20}) =>
      _repository.getRecommended(page: page, limit: limit);
}
