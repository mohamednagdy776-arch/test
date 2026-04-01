class AppNotification {
  final String id;
  final String type;
  final String message;
  final bool readStatus;
  final DateTime createdAt;

  const AppNotification({
    required this.id,
    required this.type,
    required this.message,
    required this.readStatus,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] as String,
      type: json['type'] as String,
      message: json['message'] as String,
      readStatus: json['readStatus'] as bool? ?? false,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
