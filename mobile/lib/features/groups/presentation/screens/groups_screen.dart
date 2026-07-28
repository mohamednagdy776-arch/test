import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/group.dart';
import '../state/groups_list_state.dart';
import '../providers/groups_providers.dart';
import 'group_detail_screen.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/media.dart';

// Mirrors web/src/features/groups/components/GroupList.tsx's My/Discover
// tabs + web/src/app/(main)/groups/page.tsx's create-group form. The web
// page also has a "Private groups" tab -- GET /groups/private isn't in this
// phase's controller scope (deliberately not listed), so it's left out here.
class GroupsScreen extends ConsumerStatefulWidget {
  const GroupsScreen({super.key});

  @override
  ConsumerState<GroupsScreen> createState() => _GroupsScreenState();
}

class _GroupsScreenState extends ConsumerState<GroupsScreen> {
  int _tabIndex = 0;

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(groupsListProvider.notifier).loadAll());
  }

  void _openGroup(String id) {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => GroupDetailScreen(groupId: id)));
  }

  Future<void> _showCreateDialog() async {
    final nameController = TextEditingController();
    final descController = TextEditingController();
    String privacy = 'public';

    final created = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('إنشاء مجتمع'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameController, decoration: const InputDecoration(labelText: 'الاسم')),
              const SizedBox(height: 8),
              TextField(controller: descController, decoration: const InputDecoration(labelText: 'الوصف'), maxLines: 2),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                initialValue: privacy,
                decoration: const InputDecoration(labelText: 'الخصوصية'),
                items: const [
                  DropdownMenuItem(value: 'public', child: Text('عام')),
                  DropdownMenuItem(value: 'private', child: Text('خاص')),
                  DropdownMenuItem(value: 'secret', child: Text('سري')),
                ],
                onChanged: (v) => setDialogState(() => privacy = v ?? 'public'),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('إلغاء')),
            FilledButton(
              onPressed: () async {
                if (nameController.text.trim().isEmpty) return;
                final ok = await ref.read(groupsListProvider.notifier).create(
                      name: nameController.text.trim(),
                      description: descController.text.trim(),
                      privacy: privacy,
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
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم إنشاء المجتمع')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(groupsListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('المجتمعات'),
        actions: [
          IconButton(icon: const Icon(Icons.add), onPressed: _showCreateDialog),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: SegmentedButton<int>(
              segments: const [
                ButtonSegment(value: 0, label: Text('مجتمعاتي')),
                ButtonSegment(value: 1, label: Text('اكتشف')),
                ButtonSegment(value: 2, label: Text('مقترحة')),
              ],
              selected: {_tabIndex},
              onSelectionChanged: (s) => setState(() => _tabIndex = s.first),
            ),
          ),
          if (state.error != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Text(state.error!, style: const TextStyle(color: AppTheme.dangerColor)),
            ),
          Expanded(
            child: state.isLoading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: () => ref.read(groupsListProvider.notifier).refresh(),
                    child: _buildList(_groupsForTab(state), state.pendingIds),
                  ),
          ),
        ],
      ),
    );
  }

  List<Group> _groupsForTab(GroupsListState state) {
    switch (_tabIndex) {
      case 1:
        return state.publicGroups;
      case 2:
        return state.suggested;
      default:
        return state.myGroups;
    }
  }

  Widget _buildList(List<Group> groups, Set<String> pendingIds) {
    if (groups.isEmpty) {
      return ListView(
        children: const [
          SizedBox(height: 80),
          Icon(Icons.groups_outlined, size: 48, color: AppTheme.textSecondary),
          SizedBox(height: 12),
          Center(child: Text('لا توجد مجتمعات', style: TextStyle(color: AppTheme.textSecondary))),
        ],
      );
    }
    final myGroupIds = ref.watch(groupsListProvider).myGroups.map((g) => g.id).toSet();
    return ListView.separated(
      padding: const EdgeInsets.all(12),
      itemCount: groups.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, i) {
        final g = groups[i];
        final isMember = _tabIndex == 0 || myGroupIds.contains(g.id);
        final busy = pendingIds.contains(g.id);
        final coverUrl = resolveMediaUrl(g.coverPhoto);
        return Card(
          child: ListTile(
            onTap: () => _openGroup(g.id),
            leading: CircleAvatar(
              backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
              backgroundImage: coverUrl != null ? NetworkImage(coverUrl) : null,
              child: coverUrl == null ? Text(g.name.isNotEmpty ? g.name[0] : '؟') : null,
            ),
            title: Text(g.name, style: const TextStyle(fontWeight: FontWeight.w600)),
            subtitle: Text('${g.memberCount} عضو${g.category != null ? ' · ${g.category}' : ''}'),
            trailing: busy
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : isMember
                    ? TextButton(
                        onPressed: () => ref.read(groupsListProvider.notifier).leave(g.id),
                        child: const Text('مغادرة'),
                      )
                    : TextButton(
                        onPressed: () => ref.read(groupsListProvider.notifier).join(g.id),
                        child: const Text('انضمام'),
                      ),
          ),
        );
      },
    );
  }
}
