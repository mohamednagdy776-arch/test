import '../../domain/entities/session.dart';

class SecurityState {
  final List<UserSession> sessions;
  final bool isLoading;
  final String? error;

  const SecurityState({
    this.sessions = const [],
    this.isLoading = false,
    this.error,
  });

  SecurityState copyWith({
    List<UserSession>? sessions,
    bool? isLoading,
    String? error,
  }) {
    return SecurityState(
      sessions: sessions ?? this.sessions,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}
