import 'package:dio/dio.dart';

// Every backend response follows { success, message, data } (paginated adds
// meta: { total, page, limit, totalPages }) -- backend/src/common/response.helper.ts's
// ok()/paginated(). Centralizes the unwrap so data sources don't each hand-roll
// `response.data['data']`.
class PaginatedResult<T> {
  final List<T> items;
  final int total;
  final int page;
  final int limit;
  final int totalPages;

  const PaginatedResult({
    required this.items,
    required this.total,
    required this.page,
    required this.limit,
    required this.totalPages,
  });

  bool get hasMore => page < totalPages;
}

class ApiResponse {
  ApiResponse._();

  /// Unwraps a single-object `data` field, e.g. `GET /users/me`.
  static Map<String, dynamic> unwrap(Response response) {
    final body = response.data as Map<String, dynamic>;
    return body['data'] as Map<String, dynamic>;
  }

  /// Unwraps a plain (non-paginated) `data` array.
  static List<dynamic> unwrapList(Response response) {
    final body = response.data as Map<String, dynamic>;
    return body['data'] as List<dynamic>;
  }

  /// Unwraps a paginated response into typed items + page metadata.
  static PaginatedResult<T> unwrapPaginated<T>(
    Response response,
    T Function(Map<String, dynamic>) fromJson,
  ) {
    final body = response.data as Map<String, dynamic>;
    final items = (body['data'] as List<dynamic>)
        .map((e) => fromJson(e as Map<String, dynamic>))
        .toList();
    final meta = body['meta'] as Map<String, dynamic>? ?? const {};
    return PaginatedResult<T>(
      items: items,
      total: meta['total'] as int? ?? items.length,
      page: meta['page'] as int? ?? 1,
      limit: meta['limit'] as int? ?? items.length,
      totalPages: meta['totalPages'] as int? ?? 1,
    );
  }

  static String? message(Response response) {
    final body = response.data;
    if (body is Map<String, dynamic>) return body['message'] as String?;
    return null;
  }
}
