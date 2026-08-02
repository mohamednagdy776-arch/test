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

  // ── Owner/admin-gated moderation actions (Phase 26) ──────────────────
  // These helpers deliberately let exceptions propagate (unlike load(),
  // which swallows its own) so each action's try/catch below is the only
  // place that ever writes `error` on its path -- avoids the copyWith
  // clobber bug (a later copyWith call that omits `error` resets it to null,
  // wiping out whatever an inner catch just set).
  Future<void> _reloadGroup() async {
    final group = await _detail(groupId);
    state = state.copyWith(group: group);
  }

  Future<void> _reloadMembers() async {
    final membersPage = await _detail.members(groupId);
    state = state.copyWith(members: membersPage.items);
  }

  Future<bool> updateDetails({required String name, String? description}) async {
    state = state.copyWith(isSavingDetails: true, error: null);
    try {
      await _manage.update(groupId, name: name, description: description);
      await _reloadGroup();
    } catch (_) {
      state = state.copyWith(isSavingDetails: false, error: 'تعذّر تحديث بيانات المجتمع');
      return false;
    }
    state = state.copyWith(isSavingDetails: false);
    return true;
  }

  Future<bool> deleteGroup() async {
    state = state.copyWith(isDeleting: true, error: null);
    try {
      await _manage.delete(groupId);
    } catch (_) {
      state = state.copyWith(isDeleting: false, error: 'تعذّر حذف المجتمع');
      return false;
    }
    state = state.copyWith(isDeleting: false);
    return true;
  }

  Future<bool> inviteMember(String userId) async {
    state = state.copyWith(isInviting: true, error: null);
    try {
      await _manage.invite(groupId, userId);
      await _reloadMembers();
    } catch (_) {
      state = state.copyWith(isInviting: false, error: 'تعذّر دعوة العضو');
      return false;
    }
    state = state.copyWith(isInviting: false);
    return true;
  }

  Future<bool> banMember(String userId) async {
    state = state.copyWith(isBanning: true, error: null);
    try {
      await _manage.ban(groupId, userId);
      await _reloadMembers();
    } catch (_) {
      state = state.copyWith(isBanning: false, error: 'تعذّر حظر العضو');
      return false;
    }
    state = state.copyWith(isBanning: false);
    return true;
  }

  Future<bool> unbanMember(String userId) async {
    state = state.copyWith(isBanning: true, error: null);
    try {
      await _manage.unban(groupId, userId);
      await _reloadMembers();
    } catch (_) {
      state = state.copyWith(isBanning: false, error: 'تعذّر رفع الحظر عن العضو');
      return false;
    }
    state = state.copyWith(isBanning: false);
    return true;
  }

  Future<bool> approveJoinRequest(String userId) async {
    state = state.copyWith(isApproving: true, error: null);
    try {
      await _manage.approve(groupId, userId);
      await _reloadMembers();
    } catch (_) {
      state = state.copyWith(isApproving: false, error: 'تعذّر قبول طلب الانضمام');
      return false;
    }
    state = state.copyWith(isApproving: false);
    return true;
  }

  Future<bool> rejectJoinRequest(String userId) async {
    state = state.copyWith(isRejecting: true, error: null);
    try {
      await _manage.reject(groupId, userId);
      await _reloadMembers();
    } catch (_) {
      state = state.copyWith(isRejecting: false, error: 'تعذّر رفض طلب الانضمام');
      return false;
    }
    state = state.copyWith(isRejecting: false);
    return true;
  }
}
