import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/api/api_response.dart';

class SettingsRemoteDataSource {
  final Dio _dio;
  const SettingsRemoteDataSource(this._dio);

  // ---- Privacy ----
  Future<Map<String, dynamic>> getPrivacySettings() async {
    final response = await _dio.get('/settings/privacy');
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> updatePrivacySettings(Map<String, dynamic> changes) async {
    final response = await _dio.patch('/settings/privacy', data: changes);
    return ApiResponse.unwrap(response);
  }

  Future<List<dynamic>> getBlocks() async {
    final response = await _dio.get('/blocks');
    return ApiResponse.unwrapList(response);
  }

  // DELETE /blocks/:id looks up the block by the BLOCKED USER's id, not the
  // block relation's own id (web #247) -- callers must pass blockedUserId.
  Future<void> unblockUser(String blockedUserId) async {
    await _dio.delete('/blocks/$blockedUserId');
  }

  Future<List<dynamic>> getPhotoAccessRequests() async {
    final response = await _dio.get('/photo-requests');
    return ApiResponse.unwrapList(response);
  }

  Future<void> respondToPhotoAccessRequest(String requestId, bool approve) async {
    await _dio.patch('/photo-requests/$requestId', data: {'approve': approve});
  }

  Future<Map<String, dynamic>> exportMyData() async {
    final response = await _dio.get('/users/me/export');
    return ApiResponse.unwrap(response);
  }

  // ---- Appearance ----
  Future<Map<String, dynamic>> getAppearanceSettings() async {
    final response = await _dio.get('/settings/appearance');
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> updateAppearanceSettings(Map<String, dynamic> changes) async {
    final response = await _dio.patch('/settings/appearance', data: changes);
    return ApiResponse.unwrap(response);
  }

  // ---- Notifications / newsletter ----
  Future<Map<String, dynamic>> getNotificationSettings() async {
    final response = await _dio.get('/settings/notifications');
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> updateNotificationSettings(Map<String, dynamic> changes) async {
    final response = await _dio.patch('/settings/notifications', data: changes);
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> getNewsletterSettings() async {
    final response = await _dio.get('/settings/newsletter');
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> updateNewsletterSettings(Map<String, dynamic> changes) async {
    final response = await _dio.patch('/settings/newsletter', data: changes);
    return ApiResponse.unwrap(response);
  }

  // ---- Security / sessions / 2FA (auth.controller.ts) ----
  // Lightweight identity + 2FA-enabled flag -- {id, email, accountType,
  // twoFactorEnabled}. Used instead of the full profile fetch (GET /users/me)
  // because that endpoint returns a null `id` for a brand-new account with no
  // profile row yet, which would crash Profile.fromJson's non-nullable id.
  Future<bool> getTwoFactorEnabled() async {
    final data = await _getAuthMe();
    return data['twoFactorEnabled'] as bool? ?? false;
  }

  Future<String> getCurrentEmail() async {
    final data = await _getAuthMe();
    return data['email'] as String? ?? '';
  }

  Future<Map<String, dynamic>> _getAuthMe() async {
    final response = await _dio.get('/auth/me');
    return ApiResponse.unwrap(response);
  }

  Future<List<dynamic>> getSessions() async {
    final response = await _dio.get('/auth/sessions');
    return ApiResponse.unwrapList(response);
  }

  Future<void> revokeSession(String sessionId) async {
    await _dio.post('/auth/sessions/revoke', data: {'sessionId': sessionId});
  }

  Future<void> revokeAllSessions() async {
    await _dio.post('/auth/sessions/revoke', data: {'all': true});
  }

  Future<Map<String, dynamic>> setup2FA() async {
    final response = await _dio.post('/auth/2fa/setup');
    return ApiResponse.unwrap(response);
  }

  Future<void> verify2FA(String code) async {
    await _dio.post('/auth/2fa/verify', data: {'code': code});
  }

  Future<void> disable2FA(String code) async {
    await _dio.post('/auth/2fa/disable', data: {'code': code});
  }

  Future<void> changePassword(String oldPassword, String newPassword) async {
    await _dio.post('/auth/change-password', data: {'oldPassword': oldPassword, 'newPassword': newPassword});
  }

  Future<void> deleteAccount(String password) async {
    await _dio.post('/auth/delete', data: {'password': password});
  }

  // ---- Email ----
  Future<void> requestEmailChange(String newEmail, String currentPassword) async {
    await _dio.post('/auth/change-email', data: {'newEmail': newEmail, 'currentPassword': currentPassword});
  }

  // ---- Consent ----
  // NOT wrapped in the usual {success, data, message} envelope -- confirmed
  // live via curl: consent.controller.ts's getMyConsents/respond/revoke
  // return the service result directly (no ok() call), unlike every other
  // controller in this backend. The body is also a flat array of every
  // consent request involving the caller (as either requester or target),
  // not the {incoming, outgoing} shape web's ConsentManagementPage expects --
  // web's incoming/outgoing fallback chain (`data?.incoming ?? data?.received
  // ?? []`) never matches a bare array, so its lists are always empty in
  // production. Split client-side instead (see SettingsRepositoryImpl).
  Future<List<dynamic>> getMyConsents() async {
    final response = await _dio.get('/consent/my');
    return response.data as List<dynamic>;
  }

  Future<void> respondToConsent(String id, bool accept) async {
    await _dio.post('/consent/$id/respond', data: {'accept': accept});
  }

  Future<void> revokeConsent(String id) async {
    await _dio.post('/consent/$id/revoke');
  }

  // ---- Identity verification ----
  Future<Map<String, dynamic>> getVerificationStatus() async {
    final response = await _dio.get('/verification/identity/status');
    return ApiResponse.unwrap(response);
  }

  Future<void> submitVerification(XFile selfie, XFile idDocument) async {
    final selfieBytes = await selfie.readAsBytes();
    final idBytes = await idDocument.readAsBytes();
    final formData = FormData.fromMap({
      'selfie': MultipartFile.fromBytes(selfieBytes, filename: selfie.name),
      'idDocument': MultipartFile.fromBytes(idBytes, filename: idDocument.name),
    });
    await _dio.post('/verification/identity', data: formData);
  }

  // ---- Support report ----
  Future<void> submitReport({
    required String type,
    required String description,
    String? email,
    List<XFile>? attachments,
  }) async {
    if (attachments != null && attachments.isNotEmpty) {
      final files = await Future.wait(attachments.map((f) async {
        final bytes = await f.readAsBytes();
        return MultipartFile.fromBytes(bytes, filename: f.name);
      }));
      final formData = FormData.fromMap({
        'type': type,
        'description': description,
        if (email != null && email.isNotEmpty) 'email': email,
        'attachments': files,
      });
      await _dio.post('/support/report', data: formData);
    } else {
      await _dio.post('/support/report', data: {
        'type': type,
        'description': description,
        if (email != null && email.isNotEmpty) 'email': email,
      });
    }
  }
}
