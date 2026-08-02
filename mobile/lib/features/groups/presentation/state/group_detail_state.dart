import '../../domain/entities/group.dart';
import '../../domain/entities/group_member.dart';
import '../../../posts/domain/entities/post.dart';

class GroupDetailState {
  final Group? group;
  final List<GroupMember> members;
  final List<Post> posts;
  final bool isLoading;
  final bool isJoining;
  final bool isPosting;
  // Owner/admin-gated moderation actions (Phase 26) -- one flag per action,
  // mirroring web's one-mutation-hook-per-action pattern (each disables all
  // buttons of its own kind while in flight, not just the one clicked).
  final bool isSavingDetails;
  final bool isDeleting;
  final bool isInviting;
  final bool isBanning;
  final bool isApproving;
  final bool isRejecting;
  final String? error;

  const GroupDetailState({
    this.group,
    this.members = const [],
    this.posts = const [],
    this.isLoading = false,
    this.isJoining = false,
    this.isPosting = false,
    this.isSavingDetails = false,
    this.isDeleting = false,
    this.isInviting = false,
    this.isBanning = false,
    this.isApproving = false,
    this.isRejecting = false,
    this.error,
  });

  GroupDetailState copyWith({
    Group? group,
    List<GroupMember>? members,
    List<Post>? posts,
    bool? isLoading,
    bool? isJoining,
    bool? isPosting,
    bool? isSavingDetails,
    bool? isDeleting,
    bool? isInviting,
    bool? isBanning,
    bool? isApproving,
    bool? isRejecting,
    String? error,
  }) {
    return GroupDetailState(
      group: group ?? this.group,
      members: members ?? this.members,
      posts: posts ?? this.posts,
      isLoading: isLoading ?? this.isLoading,
      isJoining: isJoining ?? this.isJoining,
      isPosting: isPosting ?? this.isPosting,
      isSavingDetails: isSavingDetails ?? this.isSavingDetails,
      isDeleting: isDeleting ?? this.isDeleting,
      isInviting: isInviting ?? this.isInviting,
      isBanning: isBanning ?? this.isBanning,
      isApproving: isApproving ?? this.isApproving,
      isRejecting: isRejecting ?? this.isRejecting,
      error: error,
    );
  }
}
