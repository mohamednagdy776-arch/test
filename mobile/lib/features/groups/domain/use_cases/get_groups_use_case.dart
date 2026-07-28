import '../../../../core/api/api_response.dart';
import '../entities/group.dart';
import '../entities/group_search_result.dart';
import '../repositories/groups_repository.dart';

// Bundles every "list groups" read (my/public/suggested/search) into one
// use case, mirroring GetFriendRequestsUseCase's multi-method shape.
class GetGroupsUseCase {
  final GroupsRepository _repository;
  const GetGroupsUseCase(this._repository);

  Future<List<Group>> myGroups() => _repository.getMyGroups();

  Future<PaginatedResult<Group>> publicGroups({int page = 1, int limit = 20, String? category}) =>
      _repository.getPublicGroups(page: page, limit: limit, category: category);

  Future<List<Group>> suggested({int limit = 5}) => _repository.getSuggestedGroups(limit: limit);

  Future<GroupSearchResult> search(String query) => _repository.searchGroups(query);
}
