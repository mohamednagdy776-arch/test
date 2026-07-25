import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/services.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/core/api/dio_client.dart';

class MockHttpClientAdapter extends Mock implements HttpClientAdapter {}

// In-memory fake for flutter_secure_storage's platform channel -- there's no
// real platform implementation under `flutter test`, so DioClient's token
// reads/writes need a stand-in.
class _FakeSecureStorageChannel {
  final Map<String, String> store = {};
  static const _channel = MethodChannel('plugins.it_nomads.com/flutter_secure_storage');

  void install() {
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(_channel, (call) async {
      final args = call.arguments as Map;
      switch (call.method) {
        case 'read':
          return store[args['key']];
        case 'write':
          store[args['key'] as String] = args['value'] as String;
          return null;
        case 'delete':
          store.remove(args['key']);
          return null;
        default:
          return null;
      }
    });
  }
}

ResponseBody _jsonBody(Map<String, dynamic> json, int statusCode) {
  return ResponseBody.fromString(
    jsonEncode(json),
    statusCode,
    headers: {
      Headers.contentTypeHeader: [Headers.jsonContentType],
    },
  );
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() {
    registerFallbackValue(RequestOptions(path: '/'));
  });

  late _FakeSecureStorageChannel storage;
  late MockHttpClientAdapter adapter;
  late Dio dio;

  setUp(() async {
    storage = _FakeSecureStorageChannel()..install();
    const secureStorage = FlutterSecureStorage();
    await secureStorage.write(key: 'access_token', value: 'old-access');
    await secureStorage.write(key: 'refresh_token', value: 'valid-refresh');

    adapter = MockHttpClientAdapter();
    dio = DioClient.create()..httpClientAdapter = adapter;
  });

  test('401 on a non-auth endpoint refreshes the token and retries the original request once', () async {
    var callCount = 0;
    when(() => adapter.fetch(any(), any(), any())).thenAnswer((invocation) async {
      final options = invocation.positionalArguments[0] as RequestOptions;
      callCount++;
      if (options.path == '/auth/refresh') {
        return _jsonBody({
          'success': true,
          'data': {'accessToken': 'new-access', 'refreshToken': 'new-refresh'},
        }, 200);
      }
      if (options.headers['Authorization'] == 'Bearer new-access') {
        return _jsonBody({
          'success': true,
          'data': {'id': 'u1'},
        }, 200);
      }
      // First attempt still carries the stale token.
      return _jsonBody({'message': 'Unauthorized'}, 401);
    });

    final response = await dio.get('/users/me');

    expect(response.data['data']['id'], 'u1');
    expect(callCount, 3); // stale request + refresh + retried request
    expect(storage.store['access_token'], 'new-access');
    expect(storage.store['refresh_token'], 'new-refresh');
  });

  test('401 on a non-auth endpoint clears tokens and propagates the error when refresh itself fails', () async {
    when(() => adapter.fetch(any(), any(), any())).thenAnswer((invocation) async {
      final options = invocation.positionalArguments[0] as RequestOptions;
      if (options.path == '/auth/refresh') {
        return _jsonBody({'message': 'Invalid refresh token'}, 401);
      }
      return _jsonBody({'message': 'Unauthorized'}, 401);
    });

    await expectLater(dio.get('/users/me'), throwsA(isA<DioException>()));

    expect(storage.store.containsKey('access_token'), isFalse);
    expect(storage.store.containsKey('refresh_token'), isFalse);
  });
}
