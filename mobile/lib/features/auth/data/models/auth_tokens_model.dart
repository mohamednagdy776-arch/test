import '../../domain/entities/auth_tokens.dart';

// Expects the already-unwrapped `data` object (see core/api/api_response.dart's
// ApiResponse.unwrap) -- { accessToken, refreshToken, ... }.
class AuthTokensModel extends AuthTokens {
  const AuthTokensModel({
    required super.accessToken,
    required super.refreshToken,
  });

  factory AuthTokensModel.fromJson(Map<String, dynamic> data) {
    return AuthTokensModel(
      accessToken: data['accessToken'] as String,
      refreshToken: data['refreshToken'] as String,
    );
  }
}
