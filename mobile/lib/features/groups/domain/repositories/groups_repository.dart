import '../../../../core/api/api_response.dart';
import '../../../posts/domain/entities/post.dart';
import '../entities/group.dart';
import '../entities/group_member.dart';
import '../entities/group_search_result.dart';

abstract class GroupsRepository {
  Future<PaginatedResult<Group>> getGroups({int page = 1, int limit = 20});
  Future<PaginatedResult<Group>> getPublicGroups({int page = 1, int limit = 20, String? category});
  Future<List<Group>> getMyGroups();
  Future<List<Group>> getSuggestedGroups({int limit = 5});
  Future<GroupSearchResult> searchGroups(String query);

  Future<Group> getGroup(String id);
  Future<Group> createGroup({required String name, String? description, String privacy = 'public', String? category});
  Future<Group> updateGroup(String id, {String? name, String? description, String? category});
  Future<void> deleteGroup(String id);
  Future<Group> joinGroup(String id);
  Future<void> leaveGroup(String id);
  Future<GroupMembersPage> getMembers(String id, {int page = 1, int limit = 50});

  // Owner/admin-gated moderation actions (Phase 26). All return the raw
  // mutated GroupMember row (id = the membership row's own id, NOT the user
  // id -- unlike getMembers()'s projection), which callers don't need since
  // the caller re-fetches getMembers()/getGroup() afterward for a consistent
  // shape; these are therefore void here.
  Future<void> inviteMember(String groupId, String userId);
  Future<void> banMember(String groupId, String userId);
  Future<void> unbanMember(String groupId, String userId);
  Future<void> approveJoinRequest(String groupId, String userId);
  Future<void> rejectJoinRequest(String groupId, String userId);

  Future<PaginatedResult<Post>> getGroupPosts(String id, {int page = 1, int limit = 20});
  Future<Post> createGroupPost(String id, {required String content});
}
