import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_constants.dart';
import '../../domain/use_cases/get_matches_use_case.dart';
import '../../domain/use_cases/generate_matches_use_case.dart';
import '../../domain/use_cases/respond_to_match_use_case.dart';
import 'matches_state.dart';

class MatchesNotifier extends StateNotifier<MatchesState> {
  final GetMatchesUseCase _getMatches;
  final GenerateMatchesUseCase _generateMatches;
  final RespondToMatchUseCase _respond;

  // No auto-load-on-construct -- same lesson as FeedNotifier (Phase 4):
  // callers trigger load() explicitly from initState so tests can stub
  // before anything fires.
  MatchesNotifier(this._getMatches, this._generateMatches, this._respond) : super(const MatchesState());

  // ageMin/ageMax are always applied (mirrors web sending them unconditionally,
  // even when left at their defaults) -- location/religiousCommitment are only
  // sent when non-empty.
  Future<void> load({String? status, int? ageMin, int? ageMax, String? location, String? religiousCommitment}) async {
    final effectiveStatus = status ?? state.status;
    final effectiveAgeMin = ageMin ?? state.ageMin;
    final effectiveAgeMax = ageMax ?? state.ageMax;
    final effectiveLocation = location ?? state.location;
    final effectiveCommitment = religiousCommitment ?? state.religiousCommitment;
    state = state.copyWith(
      status: effectiveStatus,
      ageMin: effectiveAgeMin,
      ageMax: effectiveAgeMax,
      location: effectiveLocation,
      religiousCommitment: effectiveCommitment,
      isLoading: true,
      error: null,
    );
    try {
      final page = await _getMatches(
        status: effectiveStatus,
        minAge: effectiveAgeMin,
        maxAge: effectiveAgeMax,
        location: effectiveLocation.isEmpty ? null : effectiveLocation,
        religiousCommitment: effectiveCommitment.isEmpty ? null : effectiveCommitment,
      );
      state = state.copyWith(items: page.items, isLoading: false);
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل التوافقات');
    }
  }

  Future<void> clearFilters() => load(ageMin: 18, ageMax: 45, location: '', religiousCommitment: '');

  // Mirrors web's MatchingStats: a separate, unfiltered read (page 1, limit
  // 100, no status) used only to compute counts/average -- independent of
  // the tab-filtered `items` list above.
  Future<void> loadStats() async {
    state = state.copyWith(statsLoading: true, error: state.error);
    try {
      final page = await _getMatches(page: 1, limit: 100);
      final items = page.items;
      final pending = items.where((m) => m.status == AppConstants.matchPending).length;
      final accepted = items.where((m) => m.status == AppConstants.matchAccepted).length;
      final avgScore = items.isEmpty ? 0.0 : items.map((m) => m.score).reduce((a, b) => a + b) / items.length;
      state = state.copyWith(
        statsTotal: page.total,
        statsPending: pending,
        statsAccepted: accepted,
        statsAvgScore: avgScore,
        statsLoading: false,
        error: state.error,
      );
    } catch (_) {
      state = state.copyWith(statsLoading: false, error: state.error);
    }
  }

  Future<void> generate() async {
    state = state.copyWith(isGenerating: true, error: null);
    try {
      await _generateMatches();
      await load();
      await loadStats();
    } catch (_) {
      state = state.copyWith(isGenerating: false, error: 'تعذّر توليد توافقات جديدة');
      return;
    }
    // load() already set (or cleared) its own error -- preserve whatever it
    // landed on instead of the copyWith default of wiping it to null.
    state = state.copyWith(isGenerating: false, error: state.error);
  }

  // Every response action (accept/reject/undo) moves a match out of the
  // currently-filtered list -- optimistically remove it, restore on failure.
  // A successful response also changes the pending/accepted counts, so the
  // stats header is refreshed alongside it (mirrors web invalidating
  // ['matches-all-counts'] after a successful PATCH).
  Future<void> _respondAndRemove(String matchId, Future<void> Function(String) action) async {
    final previous = state.items;
    state = state.copyWith(items: previous.where((m) => m.id != matchId).toList());
    try {
      await action(matchId);
      await loadStats();
    } catch (_) {
      state = state.copyWith(items: previous, error: 'تعذّر تنفيذ الإجراء');
    }
  }

  Future<void> accept(String matchId) => _respondAndRemove(matchId, _respond.accept);
  Future<void> reject(String matchId) => _respondAndRemove(matchId, _respond.reject);
  Future<void> undoAccept(String matchId) => _respondAndRemove(matchId, _respond.undoAccept);
  Future<void> undoReject(String matchId) => _respondAndRemove(matchId, _respond.undoReject);
}
