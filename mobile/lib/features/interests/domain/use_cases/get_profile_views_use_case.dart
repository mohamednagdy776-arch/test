import '../../../../core/api/api_response.dart';
import '../entities/profile_view_row.dart';
import '../repositories/interests_repository.dart';

class GetProfileViewsUseCase {
  final InterestsRepository _repository;
  const GetProfileViewsUseCase(this._repository);

  Future<PaginatedResult<ProfileViewRow>> call({int page = 1, int limit = 20}) =>
      _repository.getProfileViews(page: page, limit: limit);
}
