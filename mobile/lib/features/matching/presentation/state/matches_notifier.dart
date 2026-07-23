import 'package:flutter_riverpod/flutter_riverpod.dart';
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

  Future<void> load({String? status}) async {
    final effectiveStatus = status ?? state.status;
    state = state.copyWith(status: effectiveStatus, isLoading: true, error: null);
    try {
      final page = await _getMatches(status: effectiveStatus);
      state = state.copyWith(items: page.items, isLoading: false);
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل التوافقات');
    }
  }

  Future<void> generate() async {
    state = state.copyWith(isGenerating: true, error: null);
    try {
      await _generateMatches();
      await load();
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
  Future<void> _respondAndRemove(String matchId, Future<void> Function(String) action) async {
    final previous = state.items;
    state = state.copyWith(items: previous.where((m) => m.id != matchId).toList());
    try {
      await action(matchId);
    } catch (_) {
      state = state.copyWith(items: previous, error: 'تعذّر تنفيذ الإجراء');
    }
  }

  Future<void> accept(String matchId) => _respondAndRemove(matchId, _respond.accept);
  Future<void> reject(String matchId) => _respondAndRemove(matchId, _respond.reject);
  Future<void> undoAccept(String matchId) => _respondAndRemove(matchId, _respond.undoAccept);
  Future<void> undoReject(String matchId) => _respondAndRemove(matchId, _respond.undoReject);
}
