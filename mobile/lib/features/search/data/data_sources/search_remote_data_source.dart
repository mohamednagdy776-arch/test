import 'package:dio/dio.dart';
import '../../../../core/api/api_response.dart';

class SearchRemoteDataSource {
  final Dio _dio;
  const SearchRemoteDataSource(this._dio);

  Future<Map<String, dynamic>> search({
    String? q,
    String? category,
    String? gender,
    int? minAge,
    int? maxAge,
    String? country,
    String? city,
  }) async {
    final response = await _dio.get('/search', queryParameters: {
      if (q != null && q.isNotEmpty) 'q': q,
      if (category != null) 'category': category,
      if (gender != null) 'gender': gender,
      if (minAge != null) 'minAge': minAge,
      if (maxAge != null) 'maxAge': maxAge,
      if (country != null && country.isNotEmpty) 'country': country,
      if (city != null && city.isNotEmpty) 'city': city,
    });
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> autocomplete(String q) async {
    final response = await _dio.get('/search/autocomplete', queryParameters: {'q': q});
    return ApiResponse.unwrap(response);
  }
}
