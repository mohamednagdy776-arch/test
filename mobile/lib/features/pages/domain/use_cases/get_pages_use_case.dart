import '../../../../core/api/api_response.dart';
import '../entities/page.dart';
import '../repositories/pages_repository.dart';

// Bundles every "list pages" read (discover/my/created/suggested/search)
// into one use case, mirroring GetGroupsUseCase's multi-method shape.
class GetPagesUseCase {
  final PagesRepository _repository;
  const GetPagesUseCase(this._repository);

  Future<PaginatedResult<CommunityPage>> discover({int page = 1, int limit = 20, String? category}) =>
      _repository.getPages(page: page, limit: limit, category: category);

  Future<List<CommunityPage>> myPages() => _repository.getMyPages();

  Future<List<CommunityPage>> createdPages() => _repository.getCreatedPages();

  Future<List<CommunityPage>> search(String query) => _repository.searchPages(query);

  Future<List<CommunityPage>> suggested({int limit = 5}) => _repository.getSuggestedPages(limit: limit);
}
