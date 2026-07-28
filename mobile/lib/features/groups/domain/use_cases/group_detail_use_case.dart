import '../entities/group.dart';
import '../entities/group_member.dart';
import '../repositories/groups_repository.dart';

class GroupDetailUseCase {
  final GroupsRepository _repository;
  const GroupDetailUseCase(this._repository);

  Future<Group> call(String id) => _repository.getGroup(id);
  Future<GroupMembersPage> members(String id, {int page = 1, int limit = 50}) =>
      _repository.getMembers(id, page: page, limit: limit);
}
