// Mirrors GET /users/:id/activity (curl-verified live). The backend enforces
// `if (id !== user.id) throw new ForbiddenException()` -- it's private to its
// owner (an IDOR fix, not a bug), so this is only ever fetched for the
// current user's own id, matching web's ActivityLogViewer/ProfileView.tsx
// (`isSelf && profileUserId ? <ActivityLogViewer .../> : placeholder(...)`).
class ActivityLogEntry {
  final String type;
  final String description;
  final DateTime createdAt;

  const ActivityLogEntry({
    required this.type,
    required this.description,
    required this.createdAt,
  });

  factory ActivityLogEntry.fromJson(Map<String, dynamic> json) {
    return ActivityLogEntry(
      type: json['type'] as String? ?? '',
      description: json['description'] as String? ?? '',
      createdAt: DateTime.tryParse(json['createdAt'] as String? ?? '') ?? DateTime.now(),
    );
  }
}

// The whole `{ data: [...], total, page, totalPages, availableYears }` object
// sits directly under the outer `data` key -- yet another distinct envelope
// shape from posts/friends/photos (curl-verified), so it gets its own parse
// rather than reusing ApiResponse.unwrapPaginated/unwrapList.
class ActivityLogResult {
  final List<ActivityLogEntry> items;
  final List<int> availableYears;
  final int total;
  final int page;
  final int totalPages;

  const ActivityLogResult({
    this.items = const [],
    this.availableYears = const [],
    this.total = 0,
    this.page = 1,
    this.totalPages = 1,
  });

  factory ActivityLogResult.fromJson(Map<String, dynamic> json) {
    return ActivityLogResult(
      items: (json['data'] as List<dynamic>? ?? const [])
          .map((e) => ActivityLogEntry.fromJson(e as Map<String, dynamic>))
          .toList(),
      availableYears: (json['availableYears'] as List<dynamic>? ?? const [])
          .map((e) => (e as num).toInt())
          .toList(),
      total: json['total'] as int? ?? 0,
      page: json['page'] as int? ?? 1,
      totalPages: json['totalPages'] as int? ?? 1,
    );
  }
}
