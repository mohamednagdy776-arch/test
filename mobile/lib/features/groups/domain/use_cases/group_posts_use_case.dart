import '../../../../core/api/api_response.dart';
import '../../../posts/domain/entities/post.dart';
import '../repositories/groups_repository.dart';

class GroupPostsUseCase {
  final GroupsRepository _repository;
  const GroupPostsUseCase(this._repository);

  Future<PaginatedResult<Post>> getPosts(String groupId, {int page = 1, int limit = 20}) =>
      _repository.getGroupPosts(groupId, page: page, limit: limit);

  Future<Post> createPost(String groupId, {required String content}) =>
      _repository.createGroupPost(groupId, content: content);
}
