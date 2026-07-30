import '../../domain/entities/privacy_settings.dart';
import '../../domain/entities/blocked_user.dart';

class PrivacyState {
  final PrivacySettings settings;
  final List<BlockedUser> blocks;
  final List<PhotoAccessRequest> photoRequests;
  final bool isLoading;
  final String? error;

  const PrivacyState({
    this.settings = const PrivacySettings(),
    this.blocks = const [],
    this.photoRequests = const [],
    this.isLoading = false,
    this.error,
  });

  PrivacyState copyWith({
    PrivacySettings? settings,
    List<BlockedUser>? blocks,
    List<PhotoAccessRequest>? photoRequests,
    bool? isLoading,
    String? error,
  }) {
    return PrivacyState(
      settings: settings ?? this.settings,
      blocks: blocks ?? this.blocks,
      photoRequests: photoRequests ?? this.photoRequests,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}
