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
  Future<Group> joinGroup(String id);
  Future<void> leaveGroup(String id);
  Future<GroupMembersPage> getMembers(String id, {int page = 1, int limit = 50});

  Future<PaginatedResult<Post>> getGroupPosts(String id, {int page = 1, int limit = 20});
  Future<Post> createGroupPost(String id, {required String content});
}
