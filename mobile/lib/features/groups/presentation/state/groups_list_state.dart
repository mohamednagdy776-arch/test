import '../../domain/entities/group.dart';

class GroupsListState {
  final List<Group> myGroups;
  final List<Group> publicGroups;
  final List<Group> suggested;
  final bool isLoading;
  final String? error;
  final Set<String> pendingIds;

  const GroupsListState({
    this.myGroups = const [],
    this.publicGroups = const [],
    this.suggested = const [],
    this.isLoading = false,
    this.error,
    this.pendingIds = const {},
  });

  GroupsListState copyWith({
    List<Group>? myGroups,
    List<Group>? publicGroups,
    List<Group>? suggested,
    bool? isLoading,
    String? error,
    Set<String>? pendingIds,
  }) {
    return GroupsListState(
      myGroups: myGroups ?? this.myGroups,
      publicGroups: publicGroups ?? this.publicGroups,
      suggested: suggested ?? this.suggested,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      pendingIds: pendingIds ?? this.pendingIds,
    );
  }
}
