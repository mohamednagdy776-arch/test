import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/use_cases/get_memories_use_case.dart';
import 'memories_state.dart';

class MemoriesNotifier extends StateNotifier<MemoriesState> {
  final GetMemoriesUseCase _getMemories;

  MemoriesNotifier(this._getMemories) : super(const MemoriesState());

  Future<void> loadInitial() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final memories = await _getMemories();
      state = state.copyWith(memories: memories, isLoading: false);
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل الذكريات');
    }
  }

  Future<void> refresh() => loadInitial();
}
