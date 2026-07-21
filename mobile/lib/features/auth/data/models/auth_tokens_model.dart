import '../../domain/entities/auth_tokens.dart';

// Wraps the backend's { success, message, data: { accessToken, refreshToken } }
// envelope (backend/src/common/response.helper.ts's ok()) -- fromJson takes
// the raw Dio response body, not a pre-unwrapped map.
class AuthTokensModel extends AuthTokens {
  const AuthTokensModel({
    required super.accessToken,
    required super.refreshToken,
  });

  factory AuthTokensModel.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>? ?? json;
    return AuthTokensModel(
      accessToken: data['accessToken'] as String,
      refreshToken: data['refreshToken'] as String,
    );
  }
}
