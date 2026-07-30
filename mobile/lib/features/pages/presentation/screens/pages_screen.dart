import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../domain/entities/page.dart';
import '../providers/pages_providers.dart';
import '../state/pages_list_state.dart';
import 'page_detail_screen.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/media.dart';

const _pageCategories = ['دراسة', 'صحة', 'رياضة', 'تكنولوجيا', 'فنون', 'موسيقى', 'ألعاب', 'طعام', 'سفر', 'أعمال', 'أخرى'];

// Mirrors web/src/app/(main)/pages/page.tsx's create form and
// web/src/features/pages/components/PagesList.tsx's liked/created/discover
// tabs + category filter + suggested sidebar (folded into a compact row here
// instead of a desktop-only sidebar). Search is curl-verified to return a
// flat array from GET /pages/search -- NOT the likedPages/createdPages/
// otherPages buckets the web tab logic reads (a pre-existing web bug where
// its search results always render empty) -- so this shows one flat result
// list instead of replicating that.
class PagesScreen extends ConsumerStatefulWidget {
  const PagesScreen({super.key});

  @override
  ConsumerState<PagesScreen> createState() => _PagesScreenState();
}

class _PagesScreenState extends ConsumerState<PagesScreen> {
  int _tabIndex = 0;
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(pagesListProvider.notifier).loadInitial());
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _openPage(String id) {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => PageDetailScreen(pageId: id)));
  }

  Future<void> _showCreateDialog() async {
    final nameController = TextEditingController();
    final descController = TextEditingController();
    String? category;
    XFile? profilePhoto;
    XFile? coverPhoto;

    final created = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('إنشاء صفحة'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(controller: nameController, decoration: const InputDecoration(labelText: 'اسم الصفحة *')),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  initialValue: category,
                  decoration: const InputDecoration(labelText: 'الفئة (اختياري)'),
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
                  label: Text(profilePhoto == null ? 'صورة الملف الشخصي (اختياري)' : 'تم اختيار صورة'),
                ),
                const SizedBox(height: 8),
                OutlinedButton.icon(
                  onPressed: () async {
                    final picked = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 85);
                    if (picked != null) setDialogState(() => coverPhoto = picked);
                  },
                  icon: const Icon(Icons.image_outlined, size: 16),
                  label: Text(coverPhoto == null ? 'صورة الغلاف (اختياري)' : 'تم اختيار صورة'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('إلغاء')),
            FilledButton(
              onPressed: () async {
                if (nameController.text.trim().isEmpty) return;
                final ok = await ref.read(pagesListProvider.notifier).create(
                      name: nameController.text.trim(),
                      description: descController.text.trim(),
                      category: category,
                      profilePhoto: profilePhoto,
                      coverPhoto: coverPhoto,
                    );
                if (context.mounted) Navigator.pop(context, ok);
              },
              child: const Text('إنشاء'),
            ),
          ],
        ),
      ),
    );

    if (created == true && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم إنشاء الصفحة')));
    } else if (created == false && mounted && ref.read(pagesListProvider).error != null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(ref.read(pagesListProvider).error!)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(pagesListProvider);
    final isSearching = state.searchQuery.trim().length >= 2;

    return Scaffold(
      appBar: AppBar(
        title: const Text('الصفحات'),
        actions: [
          IconButton(icon: const Icon(Icons.add), onPressed: _showCreateDialog),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'ابحث عن صفحة...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () {
                          _searchController.clear();
                          ref.read(pagesListProvider.notifier).search('');
                          setState(() {});
                        },
                      )
                    : null,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onChanged: (q) {
                ref.read(pagesListProvider.notifier).search(q);
                setState(() {});
              },
            ),
          ),
          if (!isSearching)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: SegmentedButton<int>(
                segments: const [
                  ButtonSegment(value: 0, label: Text('المتابَعة')),
                  ButtonSegment(value: 1, label: Text('أنشأتها')),
                  ButtonSegment(value: 2, label: Text('اكتشف')),
                ],
                selected: {_tabIndex},
                onSelectionChanged: (s) => setState(() => _tabIndex = s.first),
              ),
            ),
          if (state.error != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              child: Text(state.error!, style: const TextStyle(color: AppTheme.dangerColor)),
            ),
          Expanded(
            child: state.isLoading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: () => ref.read(pagesListProvider.notifier).refresh(),
                    child: isSearching ? _buildSearch(state) : _buildTab(state),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearch(PagesListState state) {
    if (state.isSearching) return const Center(child: CircularProgressIndicator());
    if (state.searchResults.isEmpty) {
      return ListView(
        children: const [
          SizedBox(height: 60),
          Center(child: Text('لا توجد صفحات مطابقة', style: TextStyle(color: AppTheme.textSecondary))),
        ],
      );
    }
    return _pageList(state.searchResults, state);
  }

  Widget _buildTab(PagesListState state) {
    switch (_tabIndex) {
      case 1:
        return _pageList(state.createdPages, state, emptyText: 'لم تقم بإنشاء صفحات بعد');
      case 2:
        return _buildDiscover(state);
      default:
        return _pageList(state.myPages, state, emptyText: 'لم تعجب بصفحات بعد');
    }
  }

  Widget _buildDiscover(PagesListState state) {
    return ListView(
      children: [
        if (state.suggested.isNotEmpty) ...[
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 4),
            child: Text('مقترحة لك', style: Theme.of(context).textTheme.titleSmall),
          ),
          SizedBox(
            height: 90,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: state.suggested.length,
              separatorBuilder: (_, __) => const SizedBox(width: 10),
              itemBuilder: (context, i) {
                final p = state.suggested[i];
                final avatarUrl = resolveMediaUrl(p.profilePhoto ?? p.coverPhoto);
                return GestureDetector(
                  onTap: () => _openPage(p.id),
                  child: SizedBox(
                    width: 70,
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 26,
                          backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
                          backgroundImage: avatarUrl != null ? NetworkImage(avatarUrl) : null,
                          child: avatarUrl == null ? Text(p.name.isNotEmpty ? p.name[0] : '؟') : null,
                        ),
                        const SizedBox(height: 4),
                        Text(p.name, style: const TextStyle(fontSize: 10), maxLines: 1, overflow: TextOverflow.ellipsis),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: SizedBox(
            height: 36,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                ChoiceChip(
                  label: const Text('الكل'),
                  selected: state.category == null,
                  onSelected: (_) => ref.read(pagesListProvider.notifier).setCategory(null),
                ),
                const SizedBox(width: 6),
                ..._pageCategories.map((c) => Padding(
                      padding: const EdgeInsets.only(left: 6),
                      child: ChoiceChip(
                        label: Text(c),
                        selected: state.category == c,
                        onSelected: (_) => ref.read(pagesListProvider.notifier).setCategory(c),
                      ),
                    )),
              ],
            ),
          ),
        ),
        if (state.discoverPages.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 40),
            child: Center(child: Text('لا توجد صفحات', style: TextStyle(color: AppTheme.textSecondary))),
          )
        else ...[
          ...state.discoverPages.map((p) => _PageCard(
                page: p,
                isFollowing: state.isFollowing(p.id),
                isPending: state.pendingIds.contains(p.id),
                onTap: () => _openPage(p.id),
                onToggleFollow: () => ref.read(pagesListProvider.notifier).toggleFollow(p.id),
              )),
          if (state.hasMoreDiscover)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Center(
                child: state.isLoadingMore
                    ? const CircularProgressIndicator()
                    : TextButton(
                        onPressed: () => ref.read(pagesListProvider.notifier).loadMoreDiscover(),
                        child: const Text('عرض المزيد'),
                      ),
              ),
            ),
        ],
      ],
    );
  }

  Widget _pageList(List<Page> pages, PagesListState state, {String emptyText = 'لا توجد صفحات'}) {
    if (pages.isEmpty) {
      return ListView(
        children: [
          const SizedBox(height: 60),
          Center(child: Text(emptyText, style: const TextStyle(color: AppTheme.textSecondary))),
        ],
      );
    }
    return ListView(
      children: pages
          .map((p) => _PageCard(
                page: p,
                isFollowing: state.isFollowing(p.id),
                isPending: state.pendingIds.contains(p.id),
                onTap: () => _openPage(p.id),
                onToggleFollow: () => ref.read(pagesListProvider.notifier).toggleFollow(p.id),
              ))
          .toList(),
    );
  }
}

class _PageCard extends StatelessWidget {
  final Page page;
  final bool isFollowing;
  final bool isPending;
  final VoidCallback onTap;
  final VoidCallback onToggleFollow;

  const _PageCard({
    required this.page,
    required this.isFollowing,
    required this.isPending,
    required this.onTap,
    required this.onToggleFollow,
  });

  @override
  Widget build(BuildContext context) {
    final avatarUrl = resolveMediaUrl(page.profilePhoto ?? page.coverPhoto);
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: ListTile(
        onTap: onTap,
        leading: CircleAvatar(
          backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
          backgroundImage: avatarUrl != null ? NetworkImage(avatarUrl) : null,
          child: avatarUrl == null ? Text(page.name.isNotEmpty ? page.name[0] : '؟') : null,
        ),
        title: Row(
          children: [
            Flexible(child: Text(page.name, style: const TextStyle(fontWeight: FontWeight.w600), overflow: TextOverflow.ellipsis)),
            if (page.isVerified) const Padding(padding: EdgeInsets.only(right: 4), child: Icon(Icons.verified, size: 14, color: AppTheme.primaryColor)),
          ],
        ),
        subtitle: Text('${page.followerCount} متابع${page.category != null ? ' · ${page.category}' : ''}'),
        trailing: isPending
            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
            : TextButton(
                onPressed: onToggleFollow,
                child: Text(isFollowing ? 'إلغاء المتابعة' : 'متابعة'),
              ),
      ),
    );
  }
}
