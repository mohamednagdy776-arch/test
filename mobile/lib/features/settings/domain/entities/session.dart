// Mirrors backend/src/auth/controllers/auth.controller.ts's GET /auth/sessions.
// Confirmed live via curl: the endpoint returns only
// {id, deviceName, browser, ipAddress, lastActive, createdAt} -- no
// isActive/isCurrent field at all, despite web's SecurityPage TypeScript
// interface declaring both as optional. Since they're never actually present,
// web's "current session" badge/exclusion never fires either (isCurrent is
// always undefined) -- every session there renders with a revoke button, so
// mobile matches that real (not aspirational) behavior: no "current" badge,
// revoke available on every row.
class UserSession {
  final String id;
  final String deviceName;
  final String browser;
  final String ipAddress;
  final String lastActive;

  const UserSession({
    required this.id,
    required this.deviceName,
    required this.browser,
    required this.ipAddress,
    required this.lastActive,
  });

  factory UserSession.fromJson(Map<String, dynamic> json) {
    return UserSession(
      id: json['id'] as String? ?? '',
      deviceName: json['deviceName'] as String? ?? '',
      browser: json['browser'] as String? ?? '',
      ipAddress: json['ipAddress'] as String? ?? '',
      lastActive: json['lastActive'] as String? ?? '',
    );
  }
}
