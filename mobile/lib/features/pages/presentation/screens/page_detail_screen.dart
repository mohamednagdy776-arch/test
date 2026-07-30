import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../domain/entities/page.dart';
import '../providers/pages_providers.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/extensions.dart';
import '../../../../core/utils/media.dart';
import '../../../posts/domain/entities/post.dart';

const _pageCategories = ['دراسة', 'صحة', 'رياضة', 'تكنولوجيا', 'فنون', 'موسيقى', 'ألعاب', 'طعام', 'سفر', 'أعمال', 'أخرى'];

// Mirrors web/src/app/(main)/pages/[id]/page.tsx: cover+avatar hero,
// like/follow/share actions, owner-only edit (name/description/category +
// avatar/cover upload) and post composer, and the posts feed. Deliberately
// out of scope: the page-delete button web shows an owner (DELETE /pages/:id
// is @Roles('admin')-gated server-side -- curl-confirmed 403 for the actual
// owner, so it's dead/broken on web too) and PATCH :id/verify (admin-only,
// no owner-facing UI for it on web either).
class PageDetailScreen extends ConsumerStatefulWidget {
  final String pageId;
  const PageDetailScreen({super.key, required this.pageId});

  @override
  ConsumerState<PageDetailScreen> createState() => _PageDetailScreenState();
}

class _PageDetailScreenState extends ConsumerState<PageDetailScreen> {
  final _composerController = TextEditingController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(pageDetailProvider(widget.pageId).notifier).load());
  }

  @override
  void dispose() {
    _composerController.dispose();
    super.dispose();
  }

  Future<void> _showEditDialog(CommunityPage page) async {
    final nameController = TextEditingController(text: page.name);
    final descController = TextEditingController(text: page.description ?? '');
    String? category = page.category;
    XFile? profilePhoto;
    XFile? coverPhoto;
    final notifier = ref.read(pageDetailProvider(widget.pageId).notifier);

    final saved = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('تعديل الصفحة'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(controller: nameController, decoration: const InputDecoration(labelText: 'اسم الصفحة')),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  initialValue: category,
                  decoration: const InputDecoration(labelText: 'الفئة'),
                  items: _pageCategories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                  onChanged: (v) => setDialogState(() => category = v),
                ),
                const SizedBox(height: 8),
                TextField(controller: descController, decoration: const InputDecoration(labelText: 'الوصف'), maxLines: 2),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: () async {
                    final picked = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 85);
                    if (picked != null) setDialogState(() => profilePhoto = picked);
                  },
                  icon: const Icon(Icons.account_circle_outlined, size: 16),
                  label: Text(profilePhoto == null ? 'تغيير صورة الملف الشخصي' : 'تم اختيار صورة'),
                ),
                const SizedBox(height: 8),
                OutlinedButton.icon(
                  onPressed: () async {
                    final picked = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 85);
                    if (picked != null) setDialogState(() => coverPhoto = picked);
                  },
                  icon: const Icon(Icons.image_outlined, size: 16),
                  label: Text(coverPhoto == null ? 'تغيير صورة الغلاف' : 'تم اختيار صورة'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('إلغاء')),
            FilledButton(
              onPressed: () async {
                if (nameController.text.trim().isEmpty) return;
                final ok = await notifier.update(
                  name: nameController.text.trim(),
                  description: descController.text.trim(),
                  category: category,
                  profilePhoto: profilePhoto,
                  coverPhoto: coverPhoto,
                );
                if (context.mounted) Navigator.pop(context, ok);
              },
              child: const Text('حفظ'),
            ),
          ],
        ),
      ),
    );

    if (saved == true && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم حفظ التعديلات')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(pageDetailProvider(widget.pageId));
    final notifier = ref.read(pageDetailProvider(widget.pageId).notifier);
    final page = state.page;

    return Scaffold(
      appBar: AppBar(
        title: Text(page?.name ?? 'الصفحة'),
        actions: [
          if (page?.isOwner == true)
            IconButton(icon: const Icon(Icons.edit_outlined), onPressed: () => _showEditDialog(page!)),
        ],
      ),
      body: state.isLoading && page == null
          ? const Center(child: CircularProgressIndicator())
          : page == null
              ? Center(child: Text(state.error ?? 'تعذّر تحميل الصفحة'))
              : RefreshIndicator(
                  onRefresh: notifier.refresh,
                  child: ListView(
                    padding: const EdgeInsets.all(12),
                    children: [
                      _PageHero(page: page),
                      const SizedBox(height: 12),
                      if (state.error != null)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Text(state.error!, style: const TextStyle(color: AppTheme.dangerColor)),
                        ),
                      Row(
                        children: [
                          Expanded(
                            child: state.isLikePending
                                ? const Center(child: CircularProgressIndicator())
                                : OutlinedButton.icon(
                                    onPressed: notifier.toggleLike,
                                    icon: Icon(page.isLiked == true ? Icons.favorite : Icons.favorite_border,
                                        color: page.isLiked == true ? AppTheme.dangerColor : null),
                                    label: Text('${page.likeCount}'),
                                  ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: state.isFollowPending
                                ? const Center(child: CircularProgressIndicator())
                                : FilledButton.icon(
                                    onPressed: notifier.toggleFollow,
                                    icon: Icon(page.isFollowing == true ? Icons.check : Icons.add),
                                    label: Text(page.isFollowing == true ? 'متابَع' : 'متابعة'),
                                  ),
                          ),
                        ],
                      ),
                      if (page.description != null && page.description!.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        Text(page.description!),
                      ],
                      const SizedBox(height: 16),
                      if (page.isOwner == true) ...[
                        _Composer(controller: _composerController, isPosting: state.isPosting, onSubmit: () {
                          notifier.createPost(_composerController.text);
                          _composerController.clear();
                        }),
                        const SizedBox(height: 12),
                      ],
                      const Text('المنشورات', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      const SizedBox(height: 8),
                      if (state.posts.isEmpty)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 24),
                          child: Center(child: Text('لا توجد منشورات بعد', style: TextStyle(color: AppTheme.textSecondary))),
                        )
                      else ...[
                        ...state.posts.map((p) => _PagePostCard(post: p, page: page)),
                        if (state.hasMorePosts)
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            child: Center(
                              child: state.isLoadingMorePosts
                                  ? const CircularProgressIndicator()
                                  : TextButton(onPressed: notifier.loadMorePosts, child: const Text('تحميل المزيد')),
                            ),
                          ),
                      ],
                    ],
                  ),
                ),
    );
  }
}

class _PageHero extends StatelessWidget {
  final CommunityPage page;
  const _PageHero({required this.page});

  @override
  Widget build(BuildContext context) {
    final coverUrl = resolveMediaUrl(page.coverPhoto);
    final avatarUrl = resolveMediaUrl(page.profilePhoto);
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            height: 140,
            width: double.infinity,
            decoration: BoxDecoration(
              color: AppTheme.primaryColor.withValues(alpha: 0.08),
              image: coverUrl != null ? DecorationImage(image: NetworkImage(coverUrl), fit: BoxFit.cover) : null,
              gradient: coverUrl == null
                  ? LinearGradient(colors: [AppTheme.primaryColor.withValues(alpha: 0.5), AppTheme.accentColor.withValues(alpha: 0.3)])
                  : null,
            ),
          ),
          Positioned(
            bottom: -28,
            right: 16,
            child: CircleAvatar(
              radius: 32,
              backgroundColor: Colors.white,
              child: CircleAvatar(
                radius: 29,
                backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
                backgroundImage: avatarUrl != null ? NetworkImage(avatarUrl) : null,
                child: avatarUrl == null ? Text(page.name.isNotEmpty ? page.name[0] : '؟', style: const TextStyle(fontSize: 22)) : null,
              ),
            ),
          ),
          Positioned(
            bottom: -44,
            right: 96,
            left: 16,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(child: Text(page.name, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17), overflow: TextOverflow.ellipsis)),
                    if (page.isVerified) const Padding(padding: EdgeInsets.only(right: 4), child: Icon(Icons.verified, size: 16, color: AppTheme.primaryColor)),
                  ],
                ),
                if (page.category != null) Text(page.category!, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
              ],
            ),
          ),
          const SizedBox(height: 48, width: double.infinity),
        ],
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
            decoration: const InputDecoration(hintText: 'اكتب منشوراً على الصفحة...'),
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

class _PagePostCard extends StatelessWidget {
  final Post post;
  final CommunityPage page;
  const _PagePostCard({required this.post, required this.page});

  @override
  Widget build(BuildContext context) {
    final avatarUrl = resolveMediaUrl(page.profilePhoto);
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
                  child: avatarUrl == null ? Text(page.name.isNotEmpty ? page.name[0] : '؟') : null,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(page.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
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
