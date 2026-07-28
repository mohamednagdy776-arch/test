import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/data_sources/groups_remote_data_source.dart';
import '../../data/repositories/groups_repository_impl.dart';
import '../../domain/repositories/groups_repository.dart';
import '../../domain/use_cases/get_groups_use_case.dart';
import '../../domain/use_cases/group_detail_use_case.dart';
import '../../domain/use_cases/manage_group_use_case.dart';
import '../../domain/use_cases/group_posts_use_case.dart';
import '../state/groups_list_notifier.dart';
import '../state/groups_list_state.dart';
import '../state/group_detail_notifier.dart';
import '../state/group_detail_state.dart';
import '../../../../core/api/dio_client.dart';

final groupsRemoteDataSourceProvider = Provider((ref) {
  return GroupsRemoteDataSource(DioClient.create());
});

final groupsRepositoryProvider = Provider<GroupsRepository>((ref) {
  return GroupsRepositoryImpl(ref.read(groupsRemoteDataSourceProvider));
});

final getGroupsUseCaseProvider = Provider((ref) {
  return GetGroupsUseCase(ref.read(groupsRepositoryProvider));
});

final groupDetailUseCaseProvider = Provider((ref) {
  return GroupDetailUseCase(ref.read(groupsRepositoryProvider));
});

final manageGroupUseCaseProvider = Provider((ref) {
  return ManageGroupUseCase(ref.read(groupsRepositoryProvider));
});

final groupPostsUseCaseProvider = Provider((ref) {
  return GroupPostsUseCase(ref.read(groupsRepositoryProvider));
});

final groupsListProvider = StateNotifierProvider<GroupsListNotifier, GroupsListState>((ref) {
  return GroupsListNotifier(ref.read(getGroupsUseCaseProvider), ref.read(manageGroupUseCaseProvider));
});

final groupDetailProvider =
    StateNotifierProvider.family<GroupDetailNotifier, GroupDetailState, String>((ref, groupId) {
  return GroupDetailNotifier(
    groupId,
    ref.read(groupDetailUseCaseProvider),
    ref.read(manageGroupUseCaseProvider),
    ref.read(groupPostsUseCaseProvider),
  );
});
