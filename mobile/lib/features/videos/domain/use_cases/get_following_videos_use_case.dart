import '../../../../core/api/api_response.dart';
import '../entities/video.dart';
import '../repositories/videos_repository.dart';

class GetFollowingVideosUseCase {
  final VideosRepository _repository;
  const GetFollowingVideosUseCase(this._repository);

  Future<PaginatedResult<Video>> call({int page = 1, int limit = 20}) =>
      _repository.getFollowing(page: page, limit: limit);
}
