import 'package:dio/dio.dart';
import '../../../../core/api/api_response.dart';

class SavedRemoteDataSource {
  final Dio _dio;
  const SavedRemoteDataSource(this._dio);

  Future<List<Map<String, dynamic>>> getSaved() async {
    final response = await _dio.get('/saved');
    return ApiResponse.unwrapList(response).cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> save(String entityType, String entityId, {String? collectionId}) async {
    final response = await _dio.post('/saved', data: {
      'entityType': entityType,
      'entityId': entityId,
      if (collectionId != null) 'collectionId': collectionId,
    });
    return ApiResponse.unwrap(response);
  }

  Future<void> unsave(String itemId) async {
    await _dio.delete('/saved/$itemId');
  }

  Future<bool> checkSaved(String entityType, String entityId) async {
    final response = await _dio.get('/saved/check/$entityType/$entityId');
    return ApiResponse.unwrap(response)['isSaved'] as bool? ?? false;
  }

  Future<List<Map<String, dynamic>>> getCollections() async {
    final response = await _dio.get('/saved/collections');
    return ApiResponse.unwrapList(response).cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> createCollection(String name, {String? coverImage}) async {
    final response = await _dio.post('/saved/collections', data: {
      'name': name,
      if (coverImage != null) 'coverImage': coverImage,
    });
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> updateCollection(String id, {String? name, String? coverImage}) async {
    final response = await _dio.patch('/saved/collections/$id', data: {
      if (name != null) 'name': name,
      if (coverImage != null) 'coverImage': coverImage,
    });
    return ApiResponse.unwrap(response);
  }

  Future<void> deleteCollection(String id) async {
    await _dio.delete('/saved/collections/$id');
  }

  Future<List<Map<String, dynamic>>> getCollectionItems(String collectionId) async {
    final response = await _dio.get('/saved/collections/$collectionId');
    return ApiResponse.unwrapList(response).cast<Map<String, dynamic>>();
  }
}
