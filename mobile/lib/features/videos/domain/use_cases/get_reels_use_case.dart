import '../../../../core/api/api_response.dart';
import '../entities/video.dart';
import '../repositories/videos_repository.dart';

class GetReelsUseCase {
  final VideosRepository _repository;
  const GetReelsUseCase(this._repository);

  Future<PaginatedResult<Video>> call({int page = 1, int limit = 20}) =>
      _repository.getReels(page: page, limit: limit);
}
