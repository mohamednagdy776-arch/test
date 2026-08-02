import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_response.dart';
import '../../domain/entities/group.dart';
import '../../domain/entities/group_member.dart';
import '../providers/groups_providers.dart';
import '../state/group_detail_state.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/extensions.dart';
import '../../../../core/utils/media.dart';
import '../../../friends/domain/entities/friend_user.dart';
import '../../../friends/presentation/providers/friends_providers.dart';
import '../../../posts/domain/entities/post.dart';
import '../../../profile/presentation/screens/public_profile_screen.dart';

// Mirrors web/src/app/(main)/groups/[id]/page.tsx's full surface: hero info,
// join/leave, member list, posts feed + composer, PLUS the owner/admin-gated
// moderation actions this phase adds (Phase 26 -- Phase 11/21 deliberately
// left these out of scope): edit group, invite member, delete group,
// ban/unban member, approve/reject join request.
//
// Gating: web checks `group.isOwner || group.isAdmin`, but the backend never
// actually computes/returns `isOwner` on any groups endpoint (curl-verified
// against GET /groups/:id -- only isMember/memberCount/role/isAdmin come
// back). `isOwner` is therefore always undefined on web too; the real gate
// everywhere is `isAdmin` (role === 'admin'), which the group creator gets
// automatically on creation. All admin-only UI below is gated on
// `group.isAdmin == true` to match.
//
// Backend contract surprise (curl-verified live): DELETE /groups/:id is
// `@Roles('admin')`-gated against the platform accountType (RolesGuard reads
// user.accountType, not group membership) -- it 403s even for the group's own
// owner/admin. Same broken pattern already documented for pages
// (page_detail_screen.dart). The delete button below still mirrors web's
// (equally broken) UI exactly rather than trying to fix backend behavior.
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

  // ── Edit group (name/description) ────────────────────────────────────
  Future<void> _showEditDialog(Group group) async {
    final nameController = TextEditingController(text: group.name);
    final descController = TextEditingController(text: group.description ?? '');
    final notifier = ref.read(groupDetailProvider(widget.groupId).notifier);

    final saved = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('تعديل المجتمع'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameController, decoration: const InputDecoration(labelText: 'اسم المجتمع')),
              const SizedBox(height: 8),
              TextField(controller: descController, decoration: const InputDecoration(labelText: 'الوصف'), maxLines: 3),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('إلغاء')),
          Consumer(
            builder: (context, ref, _) {
              final isSaving = ref.watch(groupDetailProvider(widget.groupId).select((s) => s.isSavingDetails));
              return FilledButton(
                onPressed: isSaving
                    ? null
                    : () async {
                        if (nameController.text.trim().isEmpty) return;
                        final ok = await notifier.updateDetails(
                          name: nameController.text.trim(),
                          description: descController.text.trim(),
                        );
                        if (context.mounted) Navigator.pop(context, ok);
                      },
                child: isSaving
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text('حفظ'),
              );
            },
          ),
        ],
      ),
    );

    if (!mounted) return;
    if (saved == true) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم حفظ التعديلات')));
    } else if (saved == false) {
      final message = ref.read(groupDetailProvider(widget.groupId)).error ?? 'تعذّر تحديث بيانات المجتمع';
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
    }
  }

  // ── Invite member ─────────────────────────────────────────────────────
  // Reuses the existing friends list (GetFriendsUseCase, same one the
  // Friends feature is built on) rather than building new user-search infra
  // -- mirrors web's useFriends()-backed invite modal exactly.
  Future<void> _showInviteDialog() async {
    final notifier = ref.read(groupDetailProvider(widget.groupId).notifier);
    // Computed once, outside the dialog's builder, so it stays stable across
    // the Consumer's rebuilds below (a `future:` recreated on every rebuild
    // would restart the FutureBuilder and flash the loading state on every
    // invite).
    final friendsFuture = ref.read(getFriendsUseCaseProvider).call(limit: 50);

    await showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('دعوة عضو'),
        content: SizedBox(
          width: double.maxFinite,
          child: FutureBuilder<PaginatedResult<FriendUser>>(
            future: friendsFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState != ConnectionState.done) {
                return const Padding(
                  padding: EdgeInsets.symmetric(vertical: 24),
                  child: Center(child: CircularProgressIndicator()),
                );
              }
              if (snapshot.hasError) {
                return const Padding(
                  padding: EdgeInsets.symmetric(vertical: 12),
                  child: Text('تعذّر تحميل قائمة الأصدقاء'),
                );
              }
              return Consumer(
                builder: (context, ref, _) {
                  final members = ref.watch(groupDetailProvider(widget.groupId).select((s) => s.members));
                  final isInviting = ref.watch(groupDetailProvider(widget.groupId).select((s) => s.isInviting));
                  final memberIds = members.map((m) => m.id).toSet();
                  final invitable = (snapshot.data?.items ?? const [])
                      .where((f) => !memberIds.contains(f.id))
                      .toList();
                  if (invitable.isEmpty) {
                    return const Padding(
                      padding: EdgeInsets.symmetric(vertical: 24),
                      child: Center(
                        child: Text('لا يوجد أصدقاء يمكن دعوتهم', style: TextStyle(color: AppTheme.textSecondary)),
                      ),
                    );
                  }
                  return SizedBox(
                    height: 320,
                    child: ListView.separated(
                      shrinkWrap: true,
                      itemCount: invitable.length,
                      separatorBuilder: (_, __) => const Divider(height: 1),
                      itemBuilder: (context, i) {
                        final f = invitable[i];
                        final avatarUrl = resolveMediaUrl(f.avatarUrl);
                        return ListTile(
                          leading: CircleAvatar(
                            backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
                            backgroundImage: avatarUrl != null ? NetworkImage(avatarUrl) : null,
                            child: avatarUrl == null ? Text(f.fullName.isNotEmpty ? f.fullName[0] : '؟') : null,
                          ),
                          title: Text(f.fullName),
                          trailing: TextButton(
                            onPressed: isInviting
                                ? null
                                : () async {
                                    final ok = await notifier.inviteMember(f.id);
                                    if (context.mounted) {
                                      final message = ok
                                          ? 'تم إرسال الدعوة'
                                          : (ref.read(groupDetailProvider(widget.groupId)).error ?? 'تعذّر دعوة العضو');
                                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
                                    }
                                  },
                            child: const Text('دعوة'),
                          ),
                        );
                      },
                    ),
                  );
                },
              );
            },
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('إغلاق')),
        ],
      ),
    );
  }

  // ── Delete group (destructive) ───────────────────────────────────────
  Future<void> _confirmDelete(Group group) async {
    final notifier = ref.read(groupDetailProvider(widget.groupId).notifier);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('حذف المجتمع'),
        content: Text('هل أنت متأكد من حذف "${group.name}"؟ لا يمكن التراجع عن هذا الإجراء.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('إلغاء')),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppTheme.dangerColor),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('حذف'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;

    final ok = await notifier.deleteGroup();
    if (!mounted) return;
    if (ok) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم حذف المجتمع')));
      Navigator.of(context).pop();
    } else {
      final message = ref.read(groupDetailProvider(widget.groupId)).error ?? 'تعذّر حذف المجتمع';
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
    }
  }

  // ── Ban / unban / approve / reject (member management list) ─────────
  Future<void> _handleMemberAction(
    Future<bool> Function() action,
    String successMessage,
    String fallbackErrorMessage,
  ) async {
    final ok = await action();
    if (!mounted) return;
    final message = ok ? successMessage : (ref.read(groupDetailProvider(widget.groupId)).error ?? fallbackErrorMessage);
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(groupDetailProvider(widget.groupId));
    final notifier = ref.read(groupDetailProvider(widget.groupId).notifier);
    final isAdmin = state.group?.isAdmin == true;

    return Scaffold(
      appBar: AppBar(
        title: Text(state.group?.name ?? 'المجتمع'),
        actions: [
          if (isAdmin) ...[
            IconButton(
              icon: const Icon(Icons.person_add_outlined),
              tooltip: 'دعوة عضو',
              onPressed: _showInviteDialog,
            ),
            IconButton(
              icon: const Icon(Icons.edit_outlined),
              tooltip: 'تعديل المجتمع',
              onPressed: () => _showEditDialog(state.group!),
            ),
            IconButton(
              icon: const Icon(Icons.delete_outline, color: AppTheme.dangerColor),
              tooltip: 'حذف المجتمع',
              onPressed: () => _confirmDelete(state.group!),
            ),
          ],
        ],
      ),
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
                      if (isAdmin) ...[
                        const SizedBox(height: 16),
                        const Text('إدارة الأعضاء', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                        const SizedBox(height: 8),
                        _MemberManagementList(
                          members: state.members,
                          isBanning: state.isBanning,
                          isApproving: state.isApproving,
                          isRejecting: state.isRejecting,
                          onBan: (userId) => _handleMemberAction(
                            () => notifier.banMember(userId),
                            'تم حظر العضو',
                            'تعذّر حظر العضو',
                          ),
                          onUnban: (userId) => _handleMemberAction(
                            () => notifier.unbanMember(userId),
                            'تم رفع الحظر عن العضو',
                            'تعذّر رفع الحظر عن العضو',
                          ),
                          onApprove: (userId) => _handleMemberAction(
                            () => notifier.approveJoinRequest(userId),
                            'تم قبول طلب الانضمام',
                            'تعذّر قبول طلب الانضمام',
                          ),
                          onReject: (userId) => _handleMemberAction(
                            () => notifier.rejectJoinRequest(userId),
                            'تم رفض طلب الانضمام',
                            'تعذّر رفض طلب الانضمام',
                          ),
                        ),
                      ],
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
          return InkWell(
            onTap: () => Navigator.of(context).push(MaterialPageRoute(
              builder: (_) => PublicProfileScreen(userId: m.id, initialName: m.fullName),
            )),
            child: Column(
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
            ),
          );
        },
      ),
    );
  }
}

// Vertical member-management list -- only rendered for admins (see
// isAdmin gate in the screen body above). Mirrors web's manage-modal member
// list: role/banned/pending badges + the matching action(s) per row (accept/
// reject for a pending join request, ban/unban otherwise; no action shown
// for a fellow admin, matching the backend's "cannot ban an admin" rule and
// web's `m.role !== 'admin'` check).
class _MemberManagementList extends StatelessWidget {
  final List<GroupMember> members;
  final bool isBanning;
  final bool isApproving;
  final bool isRejecting;
  final void Function(String userId) onBan;
  final void Function(String userId) onUnban;
  final void Function(String userId) onApprove;
  final void Function(String userId) onReject;

  const _MemberManagementList({
    required this.members,
    required this.isBanning,
    required this.isApproving,
    required this.isRejecting,
    required this.onBan,
    required this.onUnban,
    required this.onApprove,
    required this.onReject,
  });

  Widget? _buildAction(GroupMember m) {
    if (m.status == 'pending') {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextButton(
            onPressed: isRejecting ? null : () => onReject(m.id),
            child: const Text('رفض', style: TextStyle(color: AppTheme.dangerColor)),
          ),
          TextButton(
            onPressed: isApproving ? null : () => onApprove(m.id),
            child: const Text('قبول'),
          ),
        ],
      );
    }
    if (m.role == 'admin') return null;
    return m.isBanned
        ? TextButton(onPressed: isBanning ? null : () => onUnban(m.id), child: const Text('رفع الحظر'))
        : TextButton(
            onPressed: isBanning ? null : () => onBan(m.id),
            child: const Text('حظر', style: TextStyle(color: AppTheme.dangerColor)),
          );
  }

  @override
  Widget build(BuildContext context) {
    if (members.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 12),
        child: Text('لا يوجد أعضاء', style: TextStyle(color: AppTheme.textSecondary)),
      );
    }
    return Column(
      children: members.map((m) {
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            title: Row(
              children: [
                Flexible(child: Text(m.fullName, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600))),
                if (m.role == 'admin') const Padding(padding: EdgeInsets.only(right: 6), child: _RoleBadge(text: 'مشرف', color: AppTheme.primaryColor)),
                if (m.isBanned) const Padding(padding: EdgeInsets.only(right: 6), child: _RoleBadge(text: 'محظور', color: AppTheme.dangerColor)),
                if (m.status == 'pending') const Padding(padding: EdgeInsets.only(right: 6), child: _RoleBadge(text: 'بانتظار الموافقة', color: AppTheme.warningColor)),
              ],
            ),
            trailing: _buildAction(m),
          ),
        );
      }).toList(),
    );
  }
}

class _RoleBadge extends StatelessWidget {
  final String text;
  final Color color;
  const _RoleBadge({required this.text, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(text, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color)),
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
            InkWell(
              onTap: () => Navigator.of(context).push(MaterialPageRoute(
                builder: (_) => PublicProfileScreen(
                  userId: post.userId,
                  initialName: post.authorName,
                  initialAvatarUrl: post.authorAvatarUrl,
                ),
              )),
              child: Row(
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
