class AppNotification {
  final String id;
  final String type;
  final String message;
  final bool readStatus;
  final DateTime createdAt;
  final String? entityType;
  final String? entityId;

  const AppNotification({
    required this.id,
    required this.type,
    required this.message,
    required this.readStatus,
    required this.createdAt,
    this.entityType,
    this.entityId,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] as String,
      type: json['type'] as String,
      message: json['message'] as String,
      readStatus: json['readStatus'] as bool? ?? false,
      createdAt: DateTime.parse(json['createdAt'] as String),
      entityType: json['entityType'] as String?,
      entityId: json['entityId'] as String?,
    );
  }

  AppNotification copyWith({bool? readStatus}) {
    return AppNotification(
      id: id,
      type: type,
      message: message,
      readStatus: readStatus ?? this.readStatus,
      createdAt: createdAt,
      entityType: entityType,
      entityId: entityId,
    );
  }
}
