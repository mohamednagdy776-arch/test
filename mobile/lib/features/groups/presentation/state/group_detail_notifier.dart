import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/use_cases/group_detail_use_case.dart';
import '../../domain/use_cases/manage_group_use_case.dart';
import '../../domain/use_cases/group_posts_use_case.dart';
import 'group_detail_state.dart';

class GroupDetailNotifier extends StateNotifier<GroupDetailState> {
  final String groupId;
  final GroupDetailUseCase _detail;
  final ManageGroupUseCase _manage;
  final GroupPostsUseCase _posts;

  // No auto-load-on-construct -- callers trigger load() from initState.
  GroupDetailNotifier(this.groupId, this._detail, this._manage, this._posts) : super(const GroupDetailState());

  Future<void> load() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final group = await _detail(groupId);
      final membersPage = await _detail.members(groupId);
      final postsPage = await _posts.getPosts(groupId, limit: 50);
      state = state.copyWith(
        group: group,
        members: membersPage.items,
        posts: postsPage.items,
        isLoading: false,
      );
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل بيانات المجتمع');
    }
  }

  Future<void> refresh() => load();

  Future<void> join() async {
    state = state.copyWith(isJoining: true, error: null);
    try {
      await _manage.join(groupId);
      await load();
    } catch (_) {
      state = state.copyWith(isJoining: false, error: 'تعذّر الانضمام إلى المجتمع');
      return;
    }
    state = state.copyWith(isJoining: false);
  }

  Future<void> leave() async {
    state = state.copyWith(isJoining: true, error: null);
    try {
      await _manage.leave(groupId);
      await load();
    } catch (_) {
      state = state.copyWith(isJoining: false, error: 'تعذّر مغادرة المجتمع');
      return;
    }
    state = state.copyWith(isJoining: false);
  }

  Future<void> createPost(String content) async {
    if (content.trim().isEmpty) return;
    state = state.copyWith(isPosting: true, error: null);
    try {
      final post = await _posts.createPost(groupId, content: content.trim());
      state = state.copyWith(posts: [post, ...state.posts], isPosting: false);
    } catch (_) {
      state = state.copyWith(isPosting: false, error: 'تعذّر نشر المنشور');
    }
  }
}
