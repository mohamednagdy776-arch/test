import '../../../../core/api/api_response.dart';
import '../entities/page.dart';
import '../repositories/pages_repository.dart';

// Bundles every "list pages" read (discover/my/created/suggested/search)
// into one use case, mirroring GetGroupsUseCase's multi-method shape.
class GetPagesUseCase {
  final PagesRepository _repository;
  const GetPagesUseCase(this._repository);

  Future<PaginatedResult<Page>> discover({int page = 1, int limit = 20, String? category}) =>
      _repository.getPages(page: page, limit: limit, category: category);

  Future<List<Page>> myPages() => _repository.getMyPages();

  Future<List<Page>> createdPages() => _repository.getCreatedPages();

  Future<List<Page>> search(String query) => _repository.searchPages(query);

  Future<List<Page>> suggested({int limit = 5}) => _repository.getSuggestedPages(limit: limit);
}
