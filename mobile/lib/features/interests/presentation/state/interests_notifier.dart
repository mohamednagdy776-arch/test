import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/use_cases/get_received_interests_use_case.dart';
import '../../domain/use_cases/get_sent_interests_use_case.dart';
import '../../domain/use_cases/get_profile_views_use_case.dart';
import 'interests_state.dart';

class InterestsNotifier extends StateNotifier<InterestsState> {
  final GetReceivedInterestsUseCase _getReceived;
  final GetSentInterestsUseCase _getSent;
  final GetProfileViewsUseCase _getProfileViews;

  InterestsNotifier(this._getReceived, this._getSent, this._getProfileViews)
      : super(const InterestsState());

  Future<void> loadInitial() => _loadTab(state.tab);

  Future<void> setTab(InterestsTab tab) async {
    state = state.copyWith(tab: tab);
    await _loadTab(tab);
  }

  Future<void> _loadTab(InterestsTab tab) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      switch (tab) {
        case InterestsTab.received:
          final rows = await _getReceived();
          state = state.copyWith(received: rows, isLoading: false);
          break;
        case InterestsTab.sent:
          final rows = await _getSent();
          state = state.copyWith(sent: rows, isLoading: false);
          break;
        case InterestsTab.views:
          final page = await _getProfileViews();
          state = state.copyWith(views: page.items, isLoading: false);
          break;
      }
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل البيانات');
    }
  }

  Future<void> refresh() => _loadTab(state.tab);
}
