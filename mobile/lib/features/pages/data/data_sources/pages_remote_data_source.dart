import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/api/api_response.dart';

class PagesRemoteDataSource {
  final Dio _dio;
  const PagesRemoteDataSource(this._dio);

  Future<PaginatedResult<Map<String, dynamic>>> getPages({int page = 1, int limit = 20, String? category}) async {
    final response = await _dio.get('/pages', queryParameters: {
      'page': page,
      'limit': limit,
      if (category != null && category.isNotEmpty) 'category': category,
    });
    return ApiResponse.unwrapPaginated(response, (json) => json);
  }

  Future<List<dynamic>> getMyPages() async {
    final response = await _dio.get('/pages/my');
    return ApiResponse.unwrapList(response);
  }

  Future<List<dynamic>> getCreatedPages() async {
    final response = await _dio.get('/pages/created');
    return ApiResponse.unwrapList(response);
  }

  // GET /pages/search -- curl-verified: a flat array of pages, unlike
  // web/src/features/pages/components/PagesList.tsx which reads
  // likedPages/createdPages/otherPages keys off this response that simply
  // don't exist in the live payload (a pre-existing web bug: its search tab
  // always renders empty). Modeled here as the flat list the backend
  // actually returns.
  Future<List<dynamic>> searchPages(String query) async {
    final response = await _dio.get('/pages/search', queryParameters: {'q': query});
    return ApiResponse.unwrapList(response);
  }

  Future<List<dynamic>> getSuggestedPages({int limit = 5}) async {
    final response = await _dio.get('/pages/suggested', queryParameters: {'limit': limit});
    return ApiResponse.unwrapList(response);
  }

  Future<Map<String, dynamic>> getPage(String id) async {
    final response = await _dio.get('/pages/$id');
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> getPageByUsername(String username) async {
    final response = await _dio.get('/pages/username/$username');
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> createPage({
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
    // @IsOptional() only skips null/undefined, never '' -- filter unset/empty
    // optional fields before sending (project-wide gotcha).
    final fields = {
      'name': name,
      'privacy': privacy,
      if (description != null && description.isNotEmpty) 'description': description,
      if (category != null && category.isNotEmpty) 'category': category,
      if (website != null && website.isNotEmpty) 'website': website,
      if (contactInfo != null && contactInfo.isNotEmpty) 'contactInfo': contactInfo,
      if (location != null && location.isNotEmpty) 'location': location,
      if (hours != null && hours.isNotEmpty) 'hours': hours,
    };
    final response = (profilePhoto == null && coverPhoto == null)
        ? await _dio.post('/pages', data: fields)
        : await _dio.post('/pages', data: FormData.fromMap({
            ...fields,
            if (profilePhoto != null)
              'profilePhoto': MultipartFile.fromBytes(await profilePhoto.readAsBytes(), filename: profilePhoto.name),
            if (coverPhoto != null)
              'coverPhoto': MultipartFile.fromBytes(await coverPhoto.readAsBytes(), filename: coverPhoto.name),
          }));
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> updatePage(
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
    final fields = {
      if (name != null && name.isNotEmpty) 'name': name,
      if (description != null && description.isNotEmpty) 'description': description,
      if (category != null && category.isNotEmpty) 'category': category,
      if (privacy != null && privacy.isNotEmpty) 'privacy': privacy,
      if (website != null && website.isNotEmpty) 'website': website,
      if (contactInfo != null && contactInfo.isNotEmpty) 'contactInfo': contactInfo,
      if (location != null && location.isNotEmpty) 'location': location,
      if (hours != null && hours.isNotEmpty) 'hours': hours,
    };
    final response = (profilePhoto == null && coverPhoto == null)
        ? await _dio.patch('/pages/$id', data: fields)
        : await _dio.patch('/pages/$id', data: FormData.fromMap({
            ...fields,
            if (profilePhoto != null)
              'profilePhoto': MultipartFile.fromBytes(await profilePhoto.readAsBytes(), filename: profilePhoto.name),
            if (coverPhoto != null)
              'coverPhoto': MultipartFile.fromBytes(await coverPhoto.readAsBytes(), filename: coverPhoto.name),
          }));
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> follow(String id) async {
    final response = await _dio.post('/pages/$id/follow');
    return ApiResponse.unwrap(response);
  }

  Future<void> unfollow(String id) async {
    await _dio.delete('/pages/$id/follow');
  }

  Future<Map<String, dynamic>> like(String id) async {
    final response = await _dio.post('/pages/$id/like');
    return ApiResponse.unwrap(response);
  }

  Future<void> unlike(String id) async {
    await _dio.delete('/pages/$id/like');
  }

  Future<PaginatedResult<Map<String, dynamic>>> getPagePosts(String id, {int page = 1, int limit = 20}) async {
    final response = await _dio.get('/pages/$id/posts', queryParameters: {'page': page, 'limit': limit});
    return ApiResponse.unwrapPaginated(response, (json) => json);
  }

  Future<Map<String, dynamic>> createPagePost(String id, {required String content}) async {
    final response = await _dio.post('/pages/$id/posts', data: {'content': content});
    return ApiResponse.unwrap(response);
  }
}
