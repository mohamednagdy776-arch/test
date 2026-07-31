import 'package:dio/dio.dart';

// FamilyController (backend/src/family/controllers/family.controller.ts)
// returns raw entities/arrays directly -- confirmed live, no
// {success,message,data} envelope anywhere on this controller. Contrast with
// ApiResponse.unwrap()'d endpoints elsewhere in the app.
class FamilyRemoteDataSource {
  final Dio _dio;
  const FamilyRemoteDataSource(this._dio);

  Future<List<dynamic>> getMyGuardians() async {
    final response = await _dio.get('/family/my-guardians');
    return response.data as List<dynamic>;
  }

  Future<List<dynamic>> getMyWards() async {
    final response = await _dio.get('/family/my-wards');
    return response.data as List<dynamic>;
  }

  Future<Map<String, dynamic>> inviteGuardian({
    required String guardianUserId,
    required String type,
  }) async {
    final response = await _dio.post('/family/invite-guardian', data: {
      'guardianUserId': guardianUserId,
      'type': type,
    });
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> acceptInvitation(String relationshipId) async {
    final response = await _dio.patch('/family/invitation/$relationshipId/accept');
    return response.data as Map<String, dynamic>;
  }

  // Confirmed live: 200 with an empty body.
  Future<void> revokeRelationship(String relationshipId) async {
    await _dio.delete('/family/relationship/$relationshipId');
  }
}
