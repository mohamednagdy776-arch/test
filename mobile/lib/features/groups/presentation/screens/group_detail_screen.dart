import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/group_member.dart';
import '../providers/groups_providers.dart';
import '../state/group_detail_state.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/extensions.dart';
import '../../../../core/utils/media.dart';
import '../../../posts/domain/entities/post.dart';

// Mirrors web/src/app/(main)/groups/[id]/page.tsx's member-facing surface:
// hero info, join/leave, member list, posts feed + a simple composer.
// Deliberately out of scope (per the phase brief -- moderation-only, gated
// behind isOwner/isAdmin on web, not shown to a regular member):
// manage/edit-group modal, invite, ban/unban, approve/reject join requests.
class GroupDetailScreen extends ConsumerStatefulWidget {
  final String groupId;
  const GroupDetailScreen({super.key, required this.groupId});

  @override
  ConsumerState<GroupDetailScreen> createState() => _GroupDetailScreenState();
}

class _GroupDetailScreenState extends ConsumerState<GroupDetailScreen> {
  final _composerController = TextEditingController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(groupDetailProvider(widget.groupId).notifier).load());
  }

  @override
  void dispose() {
    _composerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(groupDetailProvider(widget.groupId));
    final notifier = ref.read(groupDetailProvider(widget.groupId).notifier);

    return Scaffold(
      appBar: AppBar(title: Text(state.group?.name ?? 'المجتمع')),
      body: state.isLoading && state.group == null
          ? const Center(child: CircularProgressIndicator())
          : state.group == null
              ? Center(child: Text(state.error ?? 'تعذّر تحميل المجتمع'))
              : RefreshIndicator(
                  onRefresh: notifier.refresh,
                  child: ListView(
                    padding: const EdgeInsets.all(12),
                    children: [
                      _GroupHero(state: state, onJoin: notifier.join, onLeave: notifier.leave),
                      if (state.error != null)
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          child: Text(state.error!, style: const TextStyle(color: AppTheme.dangerColor)),
                        ),
                      const SizedBox(height: 16),
                      if (state.group!.isMember == true) ...[
                        _Composer(controller: _composerController, isPosting: state.isPosting, onSubmit: () {
                          notifier.createPost(_composerController.text);
                          _composerController.clear();
                        }),
                        const SizedBox(height: 12),
                      ],
                      Text('الأعضاء (${state.members.length})',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      const SizedBox(height: 8),
                      _MembersRow(members: state.members),
                      const SizedBox(height: 16),
                      const Text('المنشورات', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      const SizedBox(height: 8),
                      if (state.posts.isEmpty)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 24),
                          child: Center(child: Text('لا توجد منشورات بعد', style: TextStyle(color: AppTheme.textSecondary))),
                        )
                      else
                        ...state.posts.map((p) => _GroupPostCard(post: p)),
                    ],
                  ),
                ),
    );
  }
}

class _GroupHero extends StatelessWidget {
  final GroupDetailState state;
  final VoidCallback onJoin;
  final VoidCallback onLeave;
  const _GroupHero({required this.state, required this.onJoin, required this.onLeave});

  @override
  Widget build(BuildContext context) {
    final group = state.group!;
    final coverUrl = resolveMediaUrl(group.coverPhoto);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
                  backgroundImage: coverUrl != null ? NetworkImage(coverUrl) : null,
                  child: coverUrl == null ? Text(group.name.isNotEmpty ? group.name[0] : '؟') : null,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(group.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
                      Text('${group.memberCount} عضو${group.category != null ? ' · ${group.category}' : ''}',
                          style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                    ],
                  ),
                ),
              ],
            ),
            if (group.description != null && group.description!.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(group.description!),
            ],
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: state.isJoining
                  ? const Center(child: CircularProgressIndicator())
                  : group.isMember == true
                      ? OutlinedButton.icon(
                          onPressed: onLeave,
                          icon: const Icon(Icons.logout),
                          label: const Text('مغادرة المجتمع'),
                        )
                      : FilledButton.icon(
                          onPressed: onJoin,
                          icon: const Icon(Icons.group_add),
                          label: Text(group.privacy == 'private' ? 'طلب الانضمام' : 'انضمام'),
                        ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Composer extends StatelessWidget {
  final TextEditingController controller;
  final bool isPosting;
  final VoidCallback onSubmit;
  const _Composer({required this.controller, required this.isPosting, required this.onSubmit});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: TextField(
            controller: controller,
            decoration: const InputDecoration(hintText: 'اكتب شيئاً للمجتمع...'),
          ),
        ),
        const SizedBox(width: 8),
        isPosting
            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
            : IconButton(icon: const Icon(Icons.send), onPressed: onSubmit),
      ],
    );
  }
}

class _MembersRow extends StatelessWidget {
  final List<GroupMember> members;
  const _MembersRow({required this.members});

  @override
  Widget build(BuildContext context) {
    if (members.isEmpty) {
      return const Text('لا يوجد أعضاء', style: TextStyle(color: AppTheme.textSecondary));
    }
    return SizedBox(
      height: 72,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: members.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (context, i) {
          final m = members[i];
          return Column(
            children: [
              CircleAvatar(
                backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
                child: Text(m.fullName.isNotEmpty ? m.fullName[0] : '؟'),
              ),
              const SizedBox(height: 4),
              SizedBox(
                width: 56,
                child: Text(m.fullName, style: const TextStyle(fontSize: 11), maxLines: 1, overflow: TextOverflow.ellipsis, textAlign: TextAlign.center),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _GroupPostCard extends StatelessWidget {
  final Post post;
  const _GroupPostCard({required this.post});

  @override
  Widget build(BuildContext context) {
    final avatarUrl = resolveMediaUrl(post.authorAvatarUrl);
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 16,
                  backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
                  backgroundImage: avatarUrl != null ? NetworkImage(avatarUrl) : null,
                  child: avatarUrl == null ? Text(post.authorName.isNotEmpty ? post.authorName[0] : '؟') : null,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(post.authorName, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                      Text(post.createdAt.timeAgo, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                    ],
                  ),
                ),
              ],
            ),
            if (post.content.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(post.content),
            ],
          ],
        ),
      ),
    );
  }
}
