import '../constants/app_constants.dart';

// Dart port of web/src/lib/media.ts's resolveMediaUrl -- media paths
// (avatarUrl, coverUrl, thumbnailUrl, ...) come back as absolute paths from
// the server root (e.g. "/api/v1/media/avatars/x.jpg"), not relative to
// AppConstants.apiBaseUrl (which already has a trailing "/api/v1").
String? resolveMediaUrl(String? path) {
  if (path == null || path.isEmpty) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const base = AppConstants.apiBaseUrl;
  final origin = base.endsWith('/api/v1') ? base.substring(0, base.length - '/api/v1'.length) : base;
  return path.startsWith('/') ? '$origin$path' : '$origin/$path';
}
