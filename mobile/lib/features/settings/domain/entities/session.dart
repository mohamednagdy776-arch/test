// Mirrors backend/src/auth/controllers/auth.controller.ts's GET /auth/sessions.
class UserSession {
  final String id;
  final String deviceName;
  final String browser;
  final String ipAddress;
  final String lastActive;
  final bool isActive;
  final bool isCurrent;

  const UserSession({
    required this.id,
    required this.deviceName,
    required this.browser,
    required this.ipAddress,
    required this.lastActive,
    required this.isActive,
    this.isCurrent = false,
  });

  factory UserSession.fromJson(Map<String, dynamic> json) {
    return UserSession(
      id: json['id'] as String? ?? '',
      deviceName: json['deviceName'] as String? ?? '',
      browser: json['browser'] as String? ?? '',
      ipAddress: json['ipAddress'] as String? ?? '',
      lastActive: json['lastActive'] as String? ?? '',
      isActive: json['isActive'] as bool? ?? false,
      isCurrent: json['isCurrent'] as bool? ?? false,
    );
  }
}
