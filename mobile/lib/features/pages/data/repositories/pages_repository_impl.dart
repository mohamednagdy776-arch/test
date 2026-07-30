import 'package:image_picker/image_picker.dart';
import '../../../../core/api/api_response.dart';
import '../../../posts/domain/entities/post.dart';
import '../../domain/entities/page.dart';
import '../../domain/repositories/pages_repository.dart';
import '../data_sources/pages_remote_data_source.dart';

class PagesRepositoryImpl implements PagesRepository {
  final PagesRemoteDataSource _remoteDataSource;
  const PagesRepositoryImpl(this._remoteDataSource);

  @override
  Future<PaginatedResult<CommunityPage>> getPages({int page = 1, int limit = 20, String? category}) async {
    final page0 = await _remoteDataSource.getPages(page: page, limit: limit, category: category);
    return PaginatedResult(
      items: page0.items.map(CommunityPage.fromJson).toList(),
      total: page0.total,
      page: page0.page,
      limit: page0.limit,
      totalPages: page0.totalPages,
    );
  }

  @override
  Future<List<CommunityPage>> getMyPages() async {
    final data = await _remoteDataSource.getMyPages();
    return data.map((e) => CommunityPage.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<List<CommunityPage>> getCreatedPages() async {
    final data = await _remoteDataSource.getCreatedPages();
    return data.map((e) => CommunityPage.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<List<CommunityPage>> searchPages(String query) async {
    final data = await _remoteDataSource.searchPages(query);
    return data.map((e) => CommunityPage.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<List<CommunityPage>> getSuggestedPages({int limit = 5}) async {
    final data = await _remoteDataSource.getSuggestedPages(limit: limit);
    return data.map((e) => CommunityPage.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<CommunityPage> getPage(String id) async {
    final data = await _remoteDataSource.getPage(id);
    return CommunityPage.fromJson(data);
  }

  @override
  Future<CommunityPage> getPageByUsername(String username) async {
    final data = await _remoteDataSource.getPageByUsername(username);
    return CommunityPage.fromJson(data);
  }

  @override
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
  }) async {
    final data = await _remoteDataSource.createPage(
      name: name,
      description: description,
      category: category,
      privacy: privacy,
      website: website,
      contactInfo: contactInfo,
      location: location,
      hours: hours,
      profilePhoto: profilePhoto,
      coverPhoto: coverPhoto,
    );
    return CommunityPage.fromJson(data);
  }

  @override
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
  }) async {
    final data = await _remoteDataSource.updatePage(
      id,
      name: name,
      description: description,
      category: category,
      privacy: privacy,
      website: website,
      contactInfo: contactInfo,
      location: location,
      hours: hours,
      profilePhoto: profilePhoto,
      coverPhoto: coverPhoto,
    );
    return CommunityPage.fromJson(data);
  }

  @override
  Future<CommunityPage> follow(String id) async {
    final data = await _remoteDataSource.follow(id);
    return CommunityPage.fromJson(data);
  }

  @override
  Future<void> unfollow(String id) => _remoteDataSource.unfollow(id);

  @override
  Future<CommunityPage> like(String id) async {
    final data = await _remoteDataSource.like(id);
    return CommunityPage.fromJson(data);
  }

  @override
  Future<void> unlike(String id) => _remoteDataSource.unlike(id);

  @override
  Future<PaginatedResult<Post>> getPagePosts(String id, {int page = 1, int limit = 20}) async {
    final page0 = await _remoteDataSource.getPagePosts(id, page: page, limit: limit);
    return PaginatedResult(
      items: page0.items.map(Post.fromJson).toList(),
      total: page0.total,
      page: page0.page,
      limit: page0.limit,
      totalPages: page0.totalPages,
    );
  }

  @override
  Future<Post> createPagePost(String id, {required String content}) async {
    final data = await _remoteDataSource.createPagePost(id, content: content);
    return Post.fromJson(data);
  }
}
