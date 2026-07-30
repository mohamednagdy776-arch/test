import '../../domain/entities/session.dart';

class SecurityState {
  final List<UserSession> sessions;
  final bool twoFactorEnabled;
  final bool isLoading;
  final String? error;

  const SecurityState({
    this.sessions = const [],
    this.twoFactorEnabled = false,
    this.isLoading = false,
    this.error,
  });

  SecurityState copyWith({
    List<UserSession>? sessions,
    bool? twoFactorEnabled,
    bool? isLoading,
    String? error,
  }) {
    return SecurityState(
      sessions: sessions ?? this.sessions,
      twoFactorEnabled: twoFactorEnabled ?? this.twoFactorEnabled,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}
