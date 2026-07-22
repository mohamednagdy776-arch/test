import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/app_constants.dart';
import 'api_response.dart';

class DioClient {
  static const _storage = FlutterSecureStorage();

  static Dio create() {
    final dio = Dio(BaseOptions(
      baseUrl: AppConstants.apiBaseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {'Content-Type': 'application/json'},
    ));

    // Inject access token on every request
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: 'access_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        final isAuthEndpoint = error.requestOptions.path.startsWith('/auth/');
        final alreadyRetried = error.requestOptions.extra['retried'] == true;

        if (error.response?.statusCode != 401 || isAuthEndpoint || alreadyRetried) {
          handler.next(error);
          return;
        }

        // 401 on a non-auth endpoint: try one refresh, then retry the
        // original request once. Only clear tokens (forcing re-login) if the
        // refresh itself fails -- a bare Dio (no interceptors) avoids
        // recursing back into this same handler.
        final refreshToken = await _storage.read(key: 'refresh_token');
        if (refreshToken == null) {
          await _clearTokens();
          handler.next(error);
          return;
        }

        try {
          final refreshDio = Dio(BaseOptions(baseUrl: AppConstants.apiBaseUrl));
          final refreshResponse = await refreshDio.post(
            '/auth/refresh',
            data: {'refreshToken': refreshToken},
          );
          final tokens = ApiResponse.unwrap(refreshResponse);
          final newAccessToken = tokens['accessToken'] as String;
          final newRefreshToken = tokens['refreshToken'] as String;
          await _storage.write(key: 'access_token', value: newAccessToken);
          await _storage.write(key: 'refresh_token', value: newRefreshToken);

          final retryOptions = error.requestOptions;
          retryOptions.extra['retried'] = true;
          retryOptions.headers['Authorization'] = 'Bearer $newAccessToken';
          final retryResponse = await dio.fetch(retryOptions);
          handler.resolve(retryResponse);
        } catch (_) {
          await _clearTokens();
          handler.next(error);
        }
      },
    ));

    return dio;
  }

  static Future<void> _clearTokens() async {
    await _storage.delete(key: 'access_token');
    await _storage.delete(key: 'refresh_token');
  }
}
