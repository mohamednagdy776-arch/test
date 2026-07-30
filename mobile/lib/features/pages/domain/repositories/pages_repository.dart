import 'package:image_picker/image_picker.dart';
import '../../../../core/api/api_response.dart';
import '../../../posts/domain/entities/post.dart';
import '../entities/page.dart';

abstract class PagesRepository {
  Future<PaginatedResult<CommunityPage>> getPages({int page = 1, int limit = 20, String? category});
  Future<List<CommunityPage>> getMyPages();
  Future<List<CommunityPage>> getCreatedPages();
  Future<List<CommunityPage>> searchPages(String query);
  Future<List<CommunityPage>> getSuggestedPages({int limit = 5});

  Future<CommunityPage> getPage(String id);
  Future<CommunityPage> getPageByUsername(String username);

  Future<CommunityPage> createPage({
    required String name,
    String? description,
    String? category,
    String privacy = 'public',
    String? website,
    String? contactInfo,
    String? location,
    String? hours,
    XFile? profilePhoto,
    XFile? coverPhoto,
  });

  Future<CommunityPage> updatePage(
    String id, {
    String? name,
    String? description,
    String? category,
    String? privacy,
    String? website,
    String? contactInfo,
    String? location,
    String? hours,
    XFile? profilePhoto,
    XFile? coverPhoto,
  });

  Future<CommunityPage> follow(String id);
  Future<void> unfollow(String id);
  Future<CommunityPage> like(String id);
  Future<void> unlike(String id);

  Future<PaginatedResult<Post>> getPagePosts(String id, {int page = 1, int limit = 20});
  Future<Post> createPagePost(String id, {required String content});
}
