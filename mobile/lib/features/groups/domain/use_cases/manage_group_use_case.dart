import '../entities/group.dart';
import '../repositories/groups_repository.dart';

class ManageGroupUseCase {
  final GroupsRepository _repository;
  const ManageGroupUseCase(this._repository);

  Future<Group> create({required String name, String? description, String privacy = 'public', String? category}) =>
      _repository.createGroup(name: name, description: description, privacy: privacy, category: category);

  Future<Group> update(String id, {String? name, String? description, String? category}) =>
      _repository.updateGroup(id, name: name, description: description, category: category);

  Future<void> delete(String id) => _repository.deleteGroup(id);

  Future<Group> join(String id) => _repository.joinGroup(id);
  Future<void> leave(String id) => _repository.leaveGroup(id);

  // Owner/admin-gated moderation actions (Phase 26) -- mirrors
  // web/src/app/(main)/groups/[id]/page.tsx's manage modal (isOwner||isAdmin
  // gate; backend actually only checks role === 'admin' since isOwner is
  // never computed server-side -- see group_detail_screen.dart).
  Future<void> invite(String groupId, String userId) => _repository.inviteMember(groupId, userId);
  Future<void> ban(String groupId, String userId) => _repository.banMember(groupId, userId);
  Future<void> unban(String groupId, String userId) => _repository.unbanMember(groupId, userId);
  Future<void> approve(String groupId, String userId) => _repository.approveJoinRequest(groupId, userId);
  Future<void> reject(String groupId, String userId) => _repository.rejectJoinRequest(groupId, userId);
}
