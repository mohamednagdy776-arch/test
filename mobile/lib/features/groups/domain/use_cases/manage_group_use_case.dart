import '../entities/group.dart';
import '../repositories/groups_repository.dart';

class ManageGroupUseCase {
  final GroupsRepository _repository;
  const ManageGroupUseCase(this._repository);

  Future<Group> create({required String name, String? description, String privacy = 'public', String? category}) =>
      _repository.createGroup(name: name, description: description, privacy: privacy, category: category);

  Future<Group> update(String id, {String? name, String? description, String? category}) =>
      _repository.updateGroup(id, name: name, description: description, category: category);

  Future<Group> join(String id) => _repository.joinGroup(id);
  Future<void> leave(String id) => _repository.leaveGroup(id);
}
