import 'package:dio/dio.dart';
import '../../../../core/api/api_response.dart';

class AffiliatesRemoteDataSource {
  final Dio _dio;
  const AffiliatesRemoteDataSource(this._dio);

  // `data` is `null` (not an object) before the user has joined the affiliate
  // program -- confirmed live -- so read the envelope directly rather than
  // ApiResponse.unwrap()'s `as Map` cast, which would throw.
  Future<Map<String, dynamic>?> getMyAffiliate() async {
    final response = await _dio.get('/affiliates/me');
    final body = response.data as Map<String, dynamic>;
    return body['data'] as Map<String, dynamic>?;
  }

  Future<List<dynamic>> getReferrals() async {
    final response = await _dio.get('/affiliates/referrals');
    return ApiResponse.unwrapList(response);
  }

  // CreateAffiliateDto (backend/src/affiliates/dto/create-affiliate.dto.ts)
  // takes an optional `referralCode` (4-16 chars) as the desired custom
  // code; omit the field entirely for an auto-generated one rather than
  // sending an empty string (an empty-string @IsOptional field still passes
  // validation, but there's no reason to send it).
  Future<Map<String, dynamic>> joinAsAffiliate({String? referralCode}) async {
    final response = await _dio.post('/affiliates', data: {
      if (referralCode != null && referralCode.isNotEmpty) 'referralCode': referralCode,
    });
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>?> validateReferralCode(String code) async {
    final response = await _dio.get('/affiliates/code/$code');
    final body = response.data as Map<String, dynamic>;
    return body['data'] as Map<String, dynamic>?;
  }
}
