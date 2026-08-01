import 'dart:convert';
import 'package:dio/dio.dart';

// Per-message "show translation" toggle (Phase 22, item 6). The backend's
// TranslationService (backend/src/chat/services/translation.service.ts) is
// dead code -- grepped the whole backend and it is never called from any
// controller or gateway handler, so there is no live REST/socket endpoint to
// hit for it. web/src/lib/translation.ts confirms this is intentional: the
// web app translates entirely client-side (a native on-device API first,
// falling back to Google's free `gtx` endpoint), with zero backend
// involvement. This mirrors that same free `gtx` fallback path (curl-verified
// live against translate.googleapis.com, no API key required).
class ChatTranslationClient {
  final Dio _dio;

  // A bare Dio instance -- deliberately NOT DioClient.create(). This hits an
  // unrelated external host (Google's public translate endpoint), not our own
  // backend, so DioClient's baseUrl/auth-token/refresh interceptor wiring
  // does not apply and would be actively wrong here (it would try to attach
  // our own API's bearer token to a third-party request).
  ChatTranslationClient([Dio? dio]) : _dio = dio ?? Dio();

  /// Returns the translated text, or null if translation isn't possible/needed
  /// (empty input, network failure, or the source already matches [target]).
  Future<String?> translate(String text, {String target = 'ar'}) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty) return null;
    try {
      final response = await _dio.get<dynamic>(
        'https://translate.googleapis.com/translate_a/single',
        queryParameters: {'client': 'gtx', 'sl': 'auto', 'dt': 't', 'tl': target, 'q': trimmed},
      );
      final translated = parseGtxResponse(response.data);
      if (translated == null || translated.trim() == trimmed) return null;
      return translated;
    } catch (_) {
      return null;
    }
  }
}

/// Extracted as a pure function so the response-parsing logic is unit
/// testable without a real network call. The `gtx` endpoint's body shape
/// (curl-verified live) is `[[[translatedSeg, originalSeg, ...], ...], ...]`;
/// concatenates every segment's translated text.
String? parseGtxResponse(dynamic decoded) {
  if (decoded is String) {
    // Google serves this as text/html, so Dio's ResponseType.json transformer
    // hands back the raw string instead of auto-parsing it.
    try {
      decoded = jsonDecode(decoded);
    } catch (_) {
      return null;
    }
  }
  if (decoded is! List || decoded.isEmpty) return null;
  final segments = decoded[0];
  if (segments is! List) return null;
  final buffer = StringBuffer();
  for (final seg in segments) {
    if (seg is List && seg.isNotEmpty && seg[0] is String) {
      buffer.write(seg[0] as String);
    }
  }
  final result = buffer.toString();
  return result.isEmpty ? null : result;
}
