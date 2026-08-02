import '../../domain/entities/match.dart';

class MatchesState {
  final List<Match> items;
  final String status;
  final bool isLoading;
  final bool isGenerating;
  final String? error;

  // Filter-panel state -- mirrors web's MatchingPage defaults (ageMin: 18,
  // ageMax: 45, location/religiousCommitment empty = no filter). Always sent
  // to the server (server-side filtering, curl-verified live), unlike
  // location/religiousCommitment which are omitted from the query when empty.
  final int ageMin;
  final int ageMax;
  final String location;
  final String religiousCommitment;

  // Stats header -- mirrors web's MatchingStats, which fetches ALL matches
  // (page 1, limit 100, no status filter) separately from the tab-filtered
  // list below, to compute total/pending/accepted/avgScore.
  final int statsTotal;
  final int statsPending;
  final int statsAccepted;
  final double statsAvgScore;
  final bool statsLoading;

  const MatchesState({
    this.items = const [],
    this.status = 'pending',
    this.isLoading = false,
    this.isGenerating = false,
    this.error,
    this.ageMin = 18,
    this.ageMax = 45,
    this.location = '',
    this.religiousCommitment = '',
    this.statsTotal = 0,
    this.statsPending = 0,
    this.statsAccepted = 0,
    this.statsAvgScore = 0,
    this.statsLoading = false,
  });

  bool get hasFilters => location.isNotEmpty || religiousCommitment.isNotEmpty || ageMin != 18 || ageMax != 45;

  MatchesState copyWith({
    List<Match>? items,
    String? status,
    bool? isLoading,
    bool? isGenerating,
    String? error,
    int? ageMin,
    int? ageMax,
    String? location,
    String? religiousCommitment,
    int? statsTotal,
    int? statsPending,
    int? statsAccepted,
    double? statsAvgScore,
    bool? statsLoading,
  }) {
    return MatchesState(
      items: items ?? this.items,
      status: status ?? this.status,
      isLoading: isLoading ?? this.isLoading,
      isGenerating: isGenerating ?? this.isGenerating,
      error: error,
      ageMin: ageMin ?? this.ageMin,
      ageMax: ageMax ?? this.ageMax,
      location: location ?? this.location,
      religiousCommitment: religiousCommitment ?? this.religiousCommitment,
      statsTotal: statsTotal ?? this.statsTotal,
      statsPending: statsPending ?? this.statsPending,
      statsAccepted: statsAccepted ?? this.statsAccepted,
      statsAvgScore: statsAvgScore ?? this.statsAvgScore,
      statsLoading: statsLoading ?? this.statsLoading,
    );
  }
}
