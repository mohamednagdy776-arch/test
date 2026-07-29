import '../../domain/entities/interest_row.dart';
import '../../domain/entities/profile_view_row.dart';

enum InterestsTab { received, sent, views }

class InterestsState {
  final InterestsTab tab;
  final List<InterestRow> received;
  final List<InterestRow> sent;
  final List<ProfileViewRow> views;
  final bool isLoading;
  final String? error;

  const InterestsState({
    this.tab = InterestsTab.received,
    this.received = const [],
    this.sent = const [],
    this.views = const [],
    this.isLoading = false,
    this.error,
  });

  InterestsState copyWith({
    InterestsTab? tab,
    List<InterestRow>? received,
    List<InterestRow>? sent,
    List<ProfileViewRow>? views,
    bool? isLoading,
    String? error,
  }) {
    return InterestsState(
      tab: tab ?? this.tab,
      received: received ?? this.received,
      sent: sent ?? this.sent,
      views: views ?? this.views,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}
