import '../../domain/entities/match.dart';

class MatchesState {
  final List<Match> items;
  final String status;
  final bool isLoading;
  final bool isGenerating;
  final String? error;

  const MatchesState({
    this.items = const [],
    this.status = 'pending',
    this.isLoading = false,
    this.isGenerating = false,
    this.error,
  });

  MatchesState copyWith({
    List<Match>? items,
    String? status,
    bool? isLoading,
    bool? isGenerating,
    String? error,
  }) {
    return MatchesState(
      items: items ?? this.items,
      status: status ?? this.status,
      isLoading: isLoading ?? this.isLoading,
      isGenerating: isGenerating ?? this.isGenerating,
      error: error,
    );
  }
}
