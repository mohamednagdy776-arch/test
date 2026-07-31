import 'package:dio/dio.dart';

// Confirmed live: every regular-user endpoint on this controller (labs,
// my-referrals, referral-code/generate) returns the raw array/object
// directly, no {success,message,data} envelope -- same as FamilyController.
class LabPortalRemoteDataSource {
  final Dio _dio;
  const LabPortalRemoteDataSource(this._dio);

  Future<List<dynamic>> getActiveLabs() async {
    final response = await _dio.get('/lab-portal/labs');
    return response.data as List<dynamic>;
  }

  Future<List<dynamic>> getMyReferrals() async {
    final response = await _dio.get('/lab-portal/my-referrals');
    return response.data as List<dynamic>;
  }

  Future<Map<String, dynamic>> generateReferralCode(String labId) async {
    final response = await _dio.get('/lab-portal/referral-code/generate', queryParameters: {'labId': labId});
    return response.data as Map<String, dynamic>;
  }
}
