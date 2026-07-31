import 'package:dio/dio.dart';
import '../../../../core/api/api_response.dart';

class PremiumRemoteDataSource {
  final Dio _dio;
  const PremiumRemoteDataSource(this._dio);

  Future<List<dynamic>> getMySubscriptions() async {
    final response = await _dio.get('/subscriptions/me');
    return ApiResponse.unwrapList(response);
  }

  // `data` is `null` (not an object) when there's no active subscription --
  // confirmed live -- so ApiResponse.unwrap()'s `as Map` cast would throw;
  // read the envelope directly instead (same pattern as
  // reactions_remote_data_source.dart's getMyReaction).
  Future<Map<String, dynamic>?> getActiveSubscription() async {
    final response = await _dio.get('/subscriptions/me/active');
    final body = response.data as Map<String, dynamic>;
    return body['data'] as Map<String, dynamic>?;
  }

  // Backend's CreateSubscriptionDto (backend/src/subscriptions/dto/create-subscription.dto.ts)
  // takes `plan`, not `planId` -- web's features/subscriptions/api.ts actually
  // sends `{ planId }`, which 400s live ("plan must be one of the following
  // values..."), so the web upgrade flow is currently broken. Send the
  // DTO-correct key here.
  Future<Map<String, dynamic>> createSubscription(String plan) async {
    final response = await _dio.post('/subscriptions', data: {'plan': plan});
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> cancelSubscription(String id) async {
    final response = await _dio.patch('/subscriptions/$id/cancel');
    return ApiResponse.unwrap(response);
  }
}
