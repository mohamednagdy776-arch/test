class AppConstants {
  static const String appName = 'Tayyibt';
  static const String apiBaseUrl = 'http://10.0.2.2:3000/api/v1';
  static const String wsUrl = 'http://10.0.2.2:3000';

  static const int accessTokenExpiry = 15; // minutes
  static const int refreshTokenExpiry = 7; // days

  static const int defaultPageSize = 20;
  static const int minPasswordLength = 8;

  // Match status
  static const String matchPending = 'pending';
  static const String matchAccepted = 'accepted';
  static const String matchRejected = 'rejected';
  static const String matchChat = 'chat';

  // Account types
  static const String accountUser = 'user';
  static const String accountGuardian = 'guardian';
  static const String accountAgent = 'agent';
  static const String accountAdmin = 'admin';
}
