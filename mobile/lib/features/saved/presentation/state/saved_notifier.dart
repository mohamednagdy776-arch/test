import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/use_cases/get_saved_items_use_case.dart';
import '../../domain/use_cases/unsave_item_use_case.dart';
import 'saved_state.dart';

class SavedNotifier extends StateNotifier<SavedState> {
  final GetSavedItemsUseCase _getSaved;
  final UnsaveItemUseCase _unsave;

  // No auto-load-on-construct -- same convention as every other notifier
  // here; the screen kicks off loadInitial() from initState.
  SavedNotifier(this._getSaved, this._unsave) : super(const SavedState());

  Future<void> loadInitial() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final items = await _getSaved();
      state = state.copyWith(items: items, isLoading: false);
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل العناصر المحفوظة');
    }
  }

  Future<void> refresh() => loadInitial();

  Future<void> unsave(String itemId) async {
    await _unsave(itemId);
    state = state.copyWith(items: state.items.where((i) => i.id != itemId).toList());
  }
}
