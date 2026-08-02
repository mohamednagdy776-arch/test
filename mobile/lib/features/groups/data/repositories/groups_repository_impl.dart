import '../../../../core/api/api_response.dart';
import '../../../posts/domain/entities/post.dart';
import '../../domain/entities/group.dart';
import '../../domain/entities/group_member.dart';
import '../../domain/entities/group_search_result.dart';
import '../../domain/repositories/groups_repository.dart';
import '../data_sources/groups_remote_data_source.dart';

class GroupsRepositoryImpl implements GroupsRepository {
  final GroupsRemoteDataSource _remoteDataSource;
  const GroupsRepositoryImpl(this._remoteDataSource);

  PaginatedResult<Group> _toGroupPage(PaginatedResult<Map<String, dynamic>> page0) {
    return PaginatedResult(
      items: page0.items.map(Group.fromJson).toList(),
      total: page0.total,
      page: page0.page,
      limit: page0.limit,
      totalPages: page0.totalPages,
    );
  }

  @override
  Future<PaginatedResult<Group>> getGroups({int page = 1, int limit = 20}) async {
    return _toGroupPage(await _remoteDataSource.getGroups(page: page, limit: limit));
  }

  @override
  Future<PaginatedResult<Group>> getPublicGroups({int page = 1, int limit = 20, String? category}) async {
    return _toGroupPage(await _remoteDataSource.getPublicGroups(page: page, limit: limit, category: category));
  }

  @override
  Future<List<Group>> getMyGroups() async {
    final data = await _remoteDataSource.getMyGroups();
    return data.map((e) => Group.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<List<Group>> getSuggestedGroups({int limit = 5}) async {
    final data = await _remoteDataSource.getSuggestedGroups(limit: limit);
    return data.map((e) => Group.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<GroupSearchResult> searchGroups(String query) async {
    final data = await _remoteDataSource.searchGroups(query);
    return GroupSearchResult.fromJson(data);
  }

  @override
  Future<Group> getGroup(String id) async {
    final data = await _remoteDataSource.getGroup(id);
    return Group.fromJson(data);
  }

  @override
  Future<Group> createGroup({required String name, String? description, String privacy = 'public', String? category}) async {
    final data = await _remoteDataSource.createGroup(name: name, description: description, privacy: privacy, category: category);
    return Group.fromJson(data);
  }

  @override
  Future<Group> updateGroup(String id, {String? name, String? description, String? category}) async {
    final data = await _remoteDataSource.updateGroup(id, name: name, description: description, category: category);
    return Group.fromJson(data);
  }

  @override
  Future<void> deleteGroup(String id) => _remoteDataSource.deleteGroup(id);

  @override
  Future<Group> joinGroup(String id) async {
    final data = await _remoteDataSource.joinGroup(id);
    return Group.fromJson(data);
  }

  @override
  Future<void> leaveGroup(String id) => _remoteDataSource.leaveGroup(id);

  @override
  Future<void> inviteMember(String groupId, String userId) => _remoteDataSource.inviteMember(groupId, userId);

  @override
  Future<void> banMember(String groupId, String userId) => _remoteDataSource.banMember(groupId, userId);

  @override
  Future<void> unbanMember(String groupId, String userId) => _remoteDataSource.unbanMember(groupId, userId);

  @override
  Future<void> approveJoinRequest(String groupId, String userId) => _remoteDataSource.approveJoinRequest(groupId, userId);

  @override
  Future<void> rejectJoinRequest(String groupId, String userId) => _remoteDataSource.rejectJoinRequest(groupId, userId);

  @override
  Future<GroupMembersPage> getMembers(String id, {int page = 1, int limit = 50}) async {
    final data = await _remoteDataSource.getMembers(id, page: page, limit: limit);
    final items = (data['data'] as List<dynamic>? ?? const [])
        .map((e) => GroupMember.fromJson(e as Map<String, dynamic>))
        .toList();
    return GroupMembersPage(items: items, total: data['total'] as int? ?? items.length);
  }

  @override
  Future<PaginatedResult<Post>> getGroupPosts(String id, {int page = 1, int limit = 20}) async {
    final page0 = await _remoteDataSource.getGroupPosts(id, page: page, limit: limit);
    return PaginatedResult(
      items: page0.items.map(Post.fromJson).toList(),
      total: page0.total,
      page: page0.page,
      limit: page0.limit,
      totalPages: page0.totalPages,
    );
  }

  @override
  Future<Post> createGroupPost(String id, {required String content}) async {
    final data = await _remoteDataSource.createGroupPost(id, content: content);
    return Post.fromJson(data);
  }
}
