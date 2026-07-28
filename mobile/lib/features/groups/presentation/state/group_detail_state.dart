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
  final String? error;

  const GroupDetailState({
    this.group,
    this.members = const [],
    this.posts = const [],
    this.isLoading = false,
    this.isJoining = false,
    this.isPosting = false,
    this.error,
  });

  GroupDetailState copyWith({
    Group? group,
    List<GroupMember>? members,
    List<Post>? posts,
    bool? isLoading,
    bool? isJoining,
    bool? isPosting,
    String? error,
  }) {
    return GroupDetailState(
      group: group ?? this.group,
      members: members ?? this.members,
      posts: posts ?? this.posts,
      isLoading: isLoading ?? this.isLoading,
      isJoining: isJoining ?? this.isJoining,
      isPosting: isPosting ?? this.isPosting,
      error: error,
    );
  }
}
