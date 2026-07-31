import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/public_profile.dart';
import '../../domain/entities/report_reason.dart';
import '../providers/profile_providers.dart';
import '../state/public_profile_state.dart';
import '../state/public_profile_notifier.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/extensions.dart';
import '../../../../core/utils/media.dart';
import '../../../friends/domain/entities/friend_user.dart';
import '../../../friends/presentation/providers/friends_providers.dart';
import '../../../posts/domain/entities/post.dart';
import '../../../posts/presentation/screens/post_detail_screen.dart';
import '../../../videos/presentation/screens/video_detail_screen.dart';
import '../../../chat/presentation/providers/chat_providers.dart';
import '../../../chat/presentation/screens/chat_thread_screen.dart';

// Mirrors web's ProfileView.tsx (the shared component both /[username] and
// /profile/[id] ultimately reduce to for the richer, authenticated
// in-app view -- friendshipStatus embedded in the profile response, Send
// Salam, follow section, report modal, locked-photos request banner). The
// web page also has an Activity tab, but that's private-to-owner only and
// no ActivityLog feature exists anywhere else in the mobile app yet, so it's
// left out here entirely (same as the rest of the app's scope boundary).
//
// Pushed directly with a known userId (Navigator.push, no GoRoute) --
// established precedent from match/group/chat/video/post detail screens.
// initialName/initialAvatarUrl let the header render instantly from data the
// caller already had (friend card, search result, etc.) while the full
// profile loads, matching match_detail_screen's pattern for otherUserId.
class PublicProfileScreen extends ConsumerStatefulWidget {
  final String userId;
  final String? initialName;
  final String? initialAvatarUrl;

  const PublicProfileScreen({
    super.key,
    required this.userId,
    this.initialName,
    this.initialAvatarUrl,
  });

  @override
  ConsumerState<PublicProfileScreen> createState() => _PublicProfileScreenState();
}

class _PublicProfileScreenState extends ConsumerState<PublicProfileScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(publicProfileProvider(widget.userId).notifier).load());
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(publicProfileProvider(widget.userId));
    final notifier = ref.read(publicProfileProvider(widget.userId).notifier);

    return Scaffold(
      appBar: AppBar(title: Text(state.profile?.fullName ?? widget.initialName ?? 'الملف الشخصي')),
      body: state.isLoading && state.profile == null
          ? const Center(child: CircularProgressIndicator())
          : state.profile == null
              ? Center(child: Text(state.error ?? 'تعذّر تحميل الملف الشخصي'))
              : RefreshIndicator(
                  onRefresh: notifier.refresh,
                  child: ListView(
                    padding: const EdgeInsets.all(12),
                    children: [
                      _Header(profile: state.profile!, initialAvatarUrl: widget.initialAvatarUrl),
                      const SizedBox(height: 12),
                      if (!state.profile!.isSelf) _ActionsRow(userId: widget.userId, state: state, notifier: notifier),
                      if (state.error != null)
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          child: Text(state.error!, style: const TextStyle(color: AppTheme.dangerColor)),
                        ),
                      const SizedBox(height: 12),
                      SegmentedButton<PublicProfileTab>(
                        segments: const [
                          ButtonSegment(value: PublicProfileTab.posts, label: Text('المنشورات')),
                          ButtonSegment(value: PublicProfileTab.about, label: Text('عن')),
                          ButtonSegment(value: PublicProfileTab.friends, label: Text('الأصدقاء')),
                          ButtonSegment(value: PublicProfileTab.photos, label: Text('الصور')),
                          ButtonSegment(value: PublicProfileTab.videos, label: Text('الفيديوهات')),
                        ],
                        selected: {state.activeTab},
                        onSelectionChanged: (s) => notifier.setTab(s.first),
                      ),
                      const SizedBox(height: 12),
                      _TabContent(userId: widget.userId, state: state),
                    ],
                  ),
                ),
    );
  }
}

class _Header extends StatelessWidget {
  final PublicProfile profile;
  final String? initialAvatarUrl;
  const _Header({required this.profile, this.initialAvatarUrl});

  @override
  Widget build(BuildContext context) {
    final avatarUrl = resolveMediaUrl(profile.avatarUrl ?? initialAvatarUrl);
    final coverUrl = resolveMediaUrl(profile.coverUrl);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (coverUrl != null)
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.network(coverUrl, height: 120, width: double.infinity, fit: BoxFit.cover),
              ),
            const SizedBox(height: 12),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  radius: 32,
                  backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
                  backgroundImage: avatarUrl != null ? NetworkImage(avatarUrl) : null,
                  child: avatarUrl == null
                      ? Text(profile.fullName.isNotEmpty ? profile.fullName[0] : '؟', style: const TextStyle(fontSize: 22))
                      : null,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(profile.fullName,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                                overflow: TextOverflow.ellipsis),
                          ),
                          if (profile.isIdentityVerified) ...[
                            const SizedBox(width: 4),
                            const Icon(Icons.verified, size: 16, color: AppTheme.accentColor),
                          ],
                          if (profile.isHealthVerified) ...[
                            const SizedBox(width: 4),
                            const Icon(Icons.health_and_safety, size: 16, color: AppTheme.successColor),
                          ],
                        ],
                      ),
                      if (profile.username != null)
                        Text('@${profile.username}', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                      if ([profile.city, profile.country].any((e) => e != null && e.isNotEmpty))
                        Padding(
                          padding: const EdgeInsets.only(top: 2),
                          child: Text(
                            [profile.city, profile.country].where((e) => e != null && e.isNotEmpty).join('، '),
                            style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                          ),
                        ),
                      if (profile.joinDate != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 2),
                          child: Text('انضم في ${profile.joinDate!.year}',
                              style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
                        ),
                    ],
                  ),
                ),
              ],
            ),
            if (profile.bio != null && profile.bio!.isNotEmpty) ...[
              const SizedBox(height: 10),
              Text(profile.bio!),
            ],
            const SizedBox(height: 10),
            Wrap(
              spacing: 16,
              children: [
                Text('${profile.friendCount} صديق', style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                if (profile.mutualFriends > 0)
                  Text('${profile.mutualFriends} مشترك', style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ActionsRow extends ConsumerWidget {
  final String userId;
  final PublicProfileState state;
  final PublicProfileNotifier notifier;
  const _ActionsRow({required this.userId, required this.state, required this.notifier});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final status = state.profile?.friendshipStatus?.status ?? 'none';
    final isRequester = state.profile?.friendshipStatus?.isRequester ?? false;
    final busy = state.friendActionPending;

    final chips = <Widget>[];

    if (status == 'none') {
      chips.add(_ActionChip(
        icon: Icons.person_add_outlined,
        label: 'إضافة صديق',
        onTap: busy ? null : notifier.sendFriendRequest,
      ));
    } else if (status == 'pending' && isRequester) {
      chips.add(_ActionChip(icon: Icons.hourglass_empty, label: 'تم الإرسال', onTap: busy ? null : notifier.cancelFriendRequest));
    } else if (status == 'pending' && !isRequester) {
      chips.add(_ActionChip(icon: Icons.check_circle_outline, label: 'قبول الطلب', onTap: busy ? null : notifier.acceptFriendRequest));
    } else if (status == 'accepted') {
      chips.add(_ActionChip(
        icon: Icons.people_outline,
        label: 'أصدقاء',
        onTap: busy ? null : () => _confirmUnfriend(context, notifier),
      ));
    }

    chips.add(_ActionChip(
      icon: Icons.favorite_border,
      label: state.alreadySentInterest ? 'تم إرسال السلام' : 'أرسل السلام',
      onTap: (state.sendInterestPending || state.alreadySentInterest) ? null : () => _sendSalam(context, ref),
    ));

    chips.add(_ActionChip(
      icon: Icons.chat_bubble_outline,
      label: 'مراسلة',
      onTap: () => _openChat(context, ref),
    ));

    if (state.followStatus != null) {
      chips.add(_ActionChip(
        icon: state.followStatus!.following ? Icons.person_remove_outlined : Icons.person_add_alt_1_outlined,
        label: state.followStatus!.following ? 'إلغاء المتابعة' : 'متابعة',
        onTap: state.followActionPending ? null : notifier.toggleFollow,
      ));
    }

    if (status != 'blocked') {
      chips.add(_ActionChip(
        icon: Icons.block,
        label: 'حظر',
        color: AppTheme.dangerColor,
        onTap: () => _confirmBlock(context, ref, notifier),
      ));
    }

    chips.add(_ActionChip(
      icon: Icons.flag_outlined,
      label: 'إبلاغ',
      onTap: () => _openReport(context, ref, state.profile?.fullName),
    ));

    return Wrap(spacing: 8, runSpacing: 8, children: chips);
  }

  Future<void> _sendSalam(BuildContext context, WidgetRef ref) async {
    try {
      final mutual = await notifier.sendSalam();
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(mutual == true ? 'اهتمام متبادل! 🎉' : 'تم إرسال اهتمامك')),
      );
    } catch (_) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تعذّر إرسال الاهتمام')));
    }
  }

  Future<void> _openChat(BuildContext context, WidgetRef ref) async {
    try {
      final conversation = await ref.read(getOrCreateConversationUseCaseProvider).call(userId);
      if (!context.mounted) return;
      Navigator.of(context).push(MaterialPageRoute(
        builder: (_) => ChatThreadScreen(
          conversationId: conversation.id,
          title: conversation.displayName,
          otherUserId: conversation.otherUserId ?? userId,
          otherUserAvatar: conversation.otherUserAvatar,
        ),
      ));
    } catch (_) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تعذّر فتح المحادثة')));
    }
  }

  void _confirmUnfriend(BuildContext context, PublicProfileNotifier notifier) {
    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        title: const Text('إلغاء الصداقة'),
        content: const Text('هل أنت متأكد من إلغاء الصداقة؟'),
        actions: [
          TextButton(onPressed: () => Navigator.of(dialogCtx).pop(), child: const Text('إلغاء')),
          TextButton(
            onPressed: () {
              Navigator.of(dialogCtx).pop();
              notifier.unfriend();
            },
            child: const Text('تأكيد'),
          ),
        ],
      ),
    );
  }

  void _confirmBlock(BuildContext context, WidgetRef ref, PublicProfileNotifier notifier) {
    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        title: const Text('حظر المستخدم'),
        content: const Text('لن يتمكن هذا المستخدم من التواصل معك أو رؤية ملفك الشخصي. هل تريد المتابعة؟'),
        actions: [
          TextButton(onPressed: () => Navigator.of(dialogCtx).pop(), child: const Text('إلغاء')),
          TextButton(
            onPressed: () async {
              Navigator.of(dialogCtx).pop();
              try {
                await ref.read(friendRelationsUseCaseProvider).block(userId);
                if (!context.mounted) return;
                // Blocking makes the profile inaccessible (backend 404s it),
                // same reasoning as web's redirect-away-on-block fix (#276).
                Navigator.of(context).pop();
              } catch (_) {
                if (!context.mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تعذّر حظر المستخدم')));
              }
            },
            child: const Text('حظر', style: TextStyle(color: AppTheme.dangerColor)),
          ),
        ],
      ),
    );
  }

  void _openReport(BuildContext context, WidgetRef ref, String? userName) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => _ReportSheet(userId: userId, userName: userName),
    );
  }
}

class _ActionChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final Color? color;
  const _ActionChip({required this.icon, required this.label, this.onTap, this.color});

  @override
  Widget build(BuildContext context) {
    return ActionChip(
      avatar: Icon(icon, size: 16, color: color),
      label: Text(label, style: color != null ? TextStyle(color: color) : null),
      onPressed: onTap,
    );
  }
}

class _ReportSheet extends ConsumerStatefulWidget {
  final String userId;
  final String? userName;
  const _ReportSheet({required this.userId, this.userName});

  @override
  ConsumerState<_ReportSheet> createState() => _ReportSheetState();
}

class _ReportSheetState extends ConsumerState<_ReportSheet> {
  List<ReportReason> _reasons = [];
  String? _selectedReason;
  final _detailsCtrl = TextEditingController();
  bool _loading = true;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    Future.microtask(() async {
      try {
        final reasons = await ref.read(reportUserUseCaseProvider).reasons();
        if (mounted) setState(() { _reasons = reasons; _loading = false; });
      } catch (_) {
        if (mounted) setState(() => _loading = false);
      }
    });
  }

  @override
  void dispose() {
    _detailsCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_selectedReason == null) return;
    setState(() => _submitting = true);
    try {
      await ref.read(publicProfileProvider(widget.userId).notifier).submitReport(
            _selectedReason!,
            _detailsCtrl.text.trim().isEmpty ? null : _detailsCtrl.text.trim(),
          );
      if (!mounted) return;
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم استلام بلاغك، وسيقوم فريقنا بمراجعته')),
      );
    } catch (_) {
      if (mounted) setState(() => _submitting = false);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تعذّر إرسال البلاغ')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 16,
      ),
      child: _loading
          ? const SizedBox(height: 120, child: Center(child: CircularProgressIndicator()))
          : Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('إبلاغ عن ${widget.userName ?? 'المستخدم'}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 12),
                // Plain selectable ListTiles instead of RadioListTile/Radio --
                // those are deprecated in this Flutter SDK in favor of
                // RadioGroup, which isn't available yet at this project's
                // Flutter version (same convention as privacy_settings_screen.dart).
                for (final reason in _reasons)
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    dense: true,
                    leading: Icon(
                      _selectedReason == reason.id ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                      color: _selectedReason == reason.id ? AppTheme.accentColor : null,
                    ),
                    title: Text(reason.label),
                    onTap: () => setState(() => _selectedReason = reason.id),
                  ),
                const SizedBox(height: 8),
                TextField(
                  controller: _detailsCtrl,
                  maxLines: 3,
                  maxLength: 1000,
                  decoration: const InputDecoration(
                    hintText: 'تفاصيل إضافية (اختياري)',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: (_selectedReason == null || _submitting) ? null : _submit,
                    child: _submitting
                        ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Text('إرسال البلاغ'),
                  ),
                ),
              ],
            ),
    );
  }
}

class _TabContent extends StatelessWidget {
  final String userId;
  final PublicProfileState state;
  const _TabContent({required this.userId, required this.state});

  @override
  Widget build(BuildContext context) {
    switch (state.activeTab) {
      case PublicProfileTab.posts:
        return _PostsTab(state: state);
      case PublicProfileTab.about:
        return _AboutTab(profile: state.profile!);
      case PublicProfileTab.friends:
        return _FriendsTab(state: state);
      case PublicProfileTab.photos:
        return _PhotosTab(state: state);
      case PublicProfileTab.videos:
        return _VideosTab(state: state);
    }
  }
}

class _PostsTab extends StatelessWidget {
  final PublicProfileState state;
  const _PostsTab({required this.state});

  @override
  Widget build(BuildContext context) {
    if (state.postsLoading) return const Padding(padding: EdgeInsets.all(24), child: Center(child: CircularProgressIndicator()));
    if (state.posts.isEmpty) return const _EmptyTab(text: 'لا توجد منشورات بعد');
    return Column(children: [for (final post in state.posts) _PostRow(post: post)]);
  }
}

class _PostRow extends StatelessWidget {
  final Post post;
  const _PostRow({required this.post});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => PostDetailScreen(postId: post.id))),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (post.content.isNotEmpty) Text(post.content, maxLines: 4, overflow: TextOverflow.ellipsis),
              const SizedBox(height: 6),
              Text(post.createdAt.timeAgo, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
            ],
          ),
        ),
      ),
    );
  }
}

class _AboutTab extends StatelessWidget {
  final PublicProfile profile;
  const _AboutTab({required this.profile});

  @override
  Widget build(BuildContext context) {
    final rows = <(String, String)>[
      ('العمر', profile.age != null ? '${profile.age} سنة' : '—'),
      ('الجنس', profile.gender == 'male' ? 'ذكر' : profile.gender == 'female' ? 'أنثى' : '—'),
      ('التعليم', profile.education ?? '—'),
      ('الوظيفة', profile.jobTitle ?? '—'),
      ('المذهب', profile.sect ?? '—'),
      ('مستوى الصلاة', profile.prayerLevel ?? '—'),
    ];
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            for (final row in rows)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(row.$1, style: const TextStyle(color: AppTheme.textSecondary)),
                    Text(row.$2, style: const TextStyle(fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            if (profile.workEntries.isNotEmpty) ...[
              const Divider(),
              const Text('العمل', style: TextStyle(fontWeight: FontWeight.bold)),
              for (final w in profile.workEntries)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Text('${w.position ?? ''} · ${w.company ?? ''}'),
                ),
            ],
            if (profile.educationEntries.isNotEmpty) ...[
              const Divider(),
              const Text('التعليم', style: TextStyle(fontWeight: FontWeight.bold)),
              for (final e in profile.educationEntries)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Text('${e.degree ?? ''} · ${e.school ?? ''}'),
                ),
            ],
          ],
        ),
      ),
    );
  }
}

class _FriendsTab extends StatelessWidget {
  final PublicProfileState state;
  const _FriendsTab({required this.state});

  @override
  Widget build(BuildContext context) {
    if (state.friendsLoading) return const Padding(padding: EdgeInsets.all(24), child: Center(child: CircularProgressIndicator()));
    if (state.friends.isEmpty) return const _EmptyTab(text: 'لا يوجد أصدقاء');
    return GridView.count(
      crossAxisCount: 3,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 8,
      crossAxisSpacing: 8,
      children: [for (final f in state.friends) _FriendTile(friend: f)],
    );
  }
}

class _FriendTile extends StatelessWidget {
  final FriendUser friend;
  const _FriendTile({required this.friend});

  @override
  Widget build(BuildContext context) {
    final avatarUrl = resolveMediaUrl(friend.avatarUrl);
    return InkWell(
      onTap: () => Navigator.of(context).push(MaterialPageRoute(
        builder: (_) => PublicProfileScreen(userId: friend.id, initialName: friend.fullName, initialAvatarUrl: friend.avatarUrl),
      )),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          CircleAvatar(
            radius: 26,
            backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
            backgroundImage: avatarUrl != null ? NetworkImage(avatarUrl) : null,
            child: avatarUrl == null ? Text(friend.fullName.isNotEmpty ? friend.fullName[0] : '؟') : null,
          ),
          const SizedBox(height: 4),
          Text(friend.fullName, style: const TextStyle(fontSize: 11), maxLines: 1, overflow: TextOverflow.ellipsis, textAlign: TextAlign.center),
        ],
      ),
    );
  }
}

class _PhotosTab extends StatelessWidget {
  final PublicProfileState state;
  const _PhotosTab({required this.state});

  @override
  Widget build(BuildContext context) {
    if (state.photosLoading) return const Padding(padding: EdgeInsets.all(24), child: Center(child: CircularProgressIndicator()));
    if (state.profile?.photoLocked == true) return const _EmptyTab(text: 'الصور مقفلة من قِبل صاحب الملف');
    if (state.photos.isEmpty) return const _EmptyTab(text: 'لا توجد صور');
    return GridView.count(
      crossAxisCount: 3,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 4,
      crossAxisSpacing: 4,
      children: [
        for (final p in state.photos)
          GestureDetector(
            onTap: () => showDialog(
              context: context,
              builder: (_) => Dialog(
                child: Image.network(resolveMediaUrl(p.imageUrl) ?? '', fit: BoxFit.contain),
              ),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: Image.network(resolveMediaUrl(p.imageUrl) ?? '', fit: BoxFit.cover),
            ),
          ),
      ],
    );
  }
}

class _VideosTab extends StatelessWidget {
  final PublicProfileState state;
  const _VideosTab({required this.state});

  @override
  Widget build(BuildContext context) {
    if (state.videosLoading) return const Padding(padding: EdgeInsets.all(24), child: Center(child: CircularProgressIndicator()));
    if (state.videos.isEmpty) return const _EmptyTab(text: 'لا توجد فيديوهات');
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 8,
      crossAxisSpacing: 8,
      childAspectRatio: 16 / 9,
      children: [
        for (final v in state.videos)
          InkWell(
            onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => VideoDetailScreen(videoId: v.id))),
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                color: AppTheme.primaryColor.withValues(alpha: 0.08),
              ),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  if (v.thumbnailUrl != null)
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.network(resolveMediaUrl(v.thumbnailUrl!) ?? '', fit: BoxFit.cover),
                    )
                  else
                    const Center(child: Icon(Icons.movie_outlined)),
                  const Center(child: Icon(Icons.play_circle_outline, color: Colors.white, size: 32)),
                ],
              ),
            ),
          ),
      ],
    );
  }
}

class _EmptyTab extends StatelessWidget {
  final String text;
  const _EmptyTab({required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 32),
      child: Center(child: Text(text, style: const TextStyle(color: AppTheme.textSecondary))),
    );
  }
}
