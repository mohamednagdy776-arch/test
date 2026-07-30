import 'package:image_picker/image_picker.dart';
import '../../../../core/api/api_response.dart';
import '../../../posts/domain/entities/post.dart';
import '../entities/page.dart';

abstract class PagesRepository {
  Future<PaginatedResult<Page>> getPages({int page = 1, int limit = 20, String? category});
  Future<List<Page>> getMyPages();
  Future<List<Page>> getCreatedPages();
  Future<List<Page>> searchPages(String query);
  Future<List<Page>> getSuggestedPages({int limit = 5});

  Future<Page> getPage(String id);
  Future<Page> getPageByUsername(String username);

  Future<Page> createPage({
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

  Future<Page> updatePage(
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

  Future<Page> follow(String id);
  Future<void> unfollow(String id);
  Future<Page> like(String id);
  Future<void> unlike(String id);

  Future<PaginatedResult<Post>> getPagePosts(String id, {int page = 1, int limit = 20});
  Future<Post> createPagePost(String id, {required String content});
}
