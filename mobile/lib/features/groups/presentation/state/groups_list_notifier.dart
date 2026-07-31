import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/use_cases/get_groups_use_case.dart';
import '../../domain/use_cases/manage_group_use_case.dart';
import 'groups_list_state.dart';

class GroupsListNotifier extends StateNotifier<GroupsListState> {
  final GetGroupsUseCase _getGroups;
  final ManageGroupUseCase _manage;

  // No auto-load-on-construct -- same lesson as every other notifier here.
  GroupsListNotifier(this._getGroups, this._manage) : super(const GroupsListState());

  Future<void> loadAll() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final my = await _getGroups.myGroups();
      final public = await _getGroups.publicGroups();
      final suggested = await _getGroups.suggested();
      state = state.copyWith(myGroups: my, publicGroups: public.items, suggested: suggested, isLoading: false);
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل المجتمعات');
    }
  }

  Future<void> refresh() => loadAll();

  Future<void> join(String groupId) async {
    state = state.copyWith(pendingIds: {...state.pendingIds, groupId});
    try {
      await _manage.join(groupId);
      await loadAll();
    } catch (_) {
      state = state.copyWith(error: 'تعذّر الانضمام إلى المجتمع');
    } finally {
      // copyWith's `error` param isn't a nullable-preserving sentinel (matches
      // every other state class here) -- pass state.error through explicitly
      // or this finally-block copyWith would silently wipe the error the
      // catch block just set.
      state = state.copyWith(
        error: state.error,
        pendingIds: state.pendingIds.where((e) => e != groupId).toSet(),
      );
    }
  }

  Future<void> leave(String groupId) async {
    state = state.copyWith(pendingIds: {...state.pendingIds, groupId});
    try {
      await _manage.leave(groupId);
      await loadAll();
    } catch (_) {
      state = state.copyWith(error: 'تعذّر مغادرة المجتمع');
    } finally {
      // copyWith's `error` param isn't a nullable-preserving sentinel (matches
      // every other state class here) -- pass state.error through explicitly
      // or this finally-block copyWith would silently wipe the error the
      // catch block just set.
      state = state.copyWith(
        error: state.error,
        pendingIds: state.pendingIds.where((e) => e != groupId).toSet(),
      );
    }
  }

  Future<bool> create({required String name, String? description, String privacy = 'public', String? category}) async {
    try {
      await _manage.create(name: name, description: description, privacy: privacy, category: category);
      await loadAll();
      return true;
    } catch (_) {
      state = state.copyWith(error: 'تعذّر إنشاء المجتمع');
      return false;
    }
  }
}
