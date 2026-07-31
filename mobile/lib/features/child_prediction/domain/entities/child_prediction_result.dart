// Mirrors the child-prediction endpoint's response shape (confirmed live via
// curl against POST /features/child-prediction): NOT the usual
// {success,message,data} envelope -- a fully custom
// {success, image, format, mediaUrl} body. `image` is a raw base64 string
// (no "data:image/jpeg;base64," prefix -- the caller builds that itself, same
// as web does). `mediaUrl` is a server-root-relative path
// ("/api/v1/media/predictions/<id>.jpg?t=<token>") and can be null if the
// backend's best-effort persistence step failed.
class ChildPredictionResult {
  final String imageBase64;
  final String format;
  final String? mediaUrl;

  const ChildPredictionResult({
    required this.imageBase64,
    required this.format,
    this.mediaUrl,
  });

  factory ChildPredictionResult.fromJson(Map<String, dynamic> json) {
    return ChildPredictionResult(
      imageBase64: json['image'] as String,
      format: json['format'] as String? ?? 'jpeg',
      mediaUrl: json['mediaUrl'] as String?,
    );
  }
}
