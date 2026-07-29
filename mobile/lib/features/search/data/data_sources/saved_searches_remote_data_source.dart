import 'package:dio/dio.dart';
import '../../../../core/api/api_response.dart';

// backend/src/saved-searches/saved-searches.controller.ts -- not part of
// the /search controller; a distinct module (#757) with its own base path.
class SavedSearchesRemoteDataSource {
  final Dio _dio;
  const SavedSearchesRemoteDataSource(this._dio);

  Future<List<Map<String, dynamic>>> getSavedSearches() async {
    final response = await _dio.get('/saved-searches');
    return ApiResponse.unwrapList(response).cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> createSavedSearch(String name, Map<String, dynamic> filters) async {
    final response = await _dio.post('/saved-searches', data: {
      'name': name,
      'filters': filters,
    });
    return ApiResponse.unwrap(response);
  }

  Future<void> deleteSavedSearch(String id) async {
    await _dio.delete('/saved-searches/$id');
  }
}
