import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../providers/profile_providers.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/constants/routes.dart';
import '../../../../core/utils/media.dart';
import '../../../posts/presentation/screens/archive_screen.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool _uploadingAvatar = false;

  Future<void> _pickAndUploadAvatar() async {
    final picked = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (picked == null) return;
    setState(() => _uploadingAvatar = true);
    try {
      await ref.read(uploadAvatarUseCaseProvider).call(picked);
      ref.invalidate(myProfileProvider);
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تعذّر رفع الصورة، حاول مرة أخرى')),
      );
    } finally {
      if (mounted) setState(() => _uploadingAvatar = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final profileAsync = ref.watch(myProfileProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('الملف الشخصي')),
      body: profileAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('تعذّر التحميل: $error')),
        data: (profile) => SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Stack(
                children: [
                  CircleAvatar(
                    radius: 50,
                    backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
                    backgroundImage: resolveMediaUrl(profile.avatarUrl) != null
                        ? NetworkImage(resolveMediaUrl(profile.avatarUrl)!)
                        : null,
                    child: resolveMediaUrl(profile.avatarUrl) == null
                        ? Text(
                            (profile.fullName?.isNotEmpty ?? false) ? profile.fullName![0].toUpperCase() : '?',
                            style: const TextStyle(fontSize: 32, color: AppTheme.primaryColor),
                          )
                        : null,
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: InkWell(
                      onTap: _uploadingAvatar ? null : _pickAndUploadAvatar,
                      child: CircleAvatar(
                        radius: 16,
                        backgroundColor: AppTheme.accentColor,
                        child: _uploadingAvatar
                            ? const SizedBox(
                                height: 12,
                                width: 12,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                            : const Icon(Icons.camera_alt, size: 16, color: Colors.white),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                profile.fullName ?? 'مستخدم',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              if (profile.age != null) Text('${profile.age} سنة'),
              if (profile.country != null) Text('${profile.city ?? ''}, ${profile.country}'),
              const SizedBox(height: 24),
              _buildSection(context, 'نبذة', profile.bio ?? 'لا توجد نبذة بعد'),
              _buildSection(context, 'المذهب', profile.sect ?? 'غير محدد'),
              _buildSection(context, 'التعليم', profile.education ?? 'غير محدد'),
              _buildSection(context, 'الوظيفة', profile.jobTitle ?? 'غير محدد'),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: () => context.push(AppRoutes.extendedProfile),
                icon: const Icon(Icons.tune),
                label: const Text('الملف الشخصي الموسّع'),
              ),
              const SizedBox(height: 24),
              _buildPremiumBanner(context),
              const SizedBox(height: 16),
              _buildMenu(context),
            ],
          ),
        ),
      ),
    );
  }

  // Web gives premium/upgrade its own standout treatment -- a gold gradient
  // card in the sidebar plus a Crown CTA in the navbar (Sidebar.tsx,
  // Navbar.tsx) -- distinct from the plain nav-item styling every other
  // secondary feature gets there (including /affiliates, which web lists as
  // an ordinary sidebar/bottom-nav item). Mirrored here as a standout gold
  // banner above the menu card, using AppTheme.accentColor (the same
  // "antique gold" #B8892A web's CSS var(--accent) resolves to in the
  // luxury/Emerald Sanctum theme this app hardcodes).
  Widget _buildPremiumBanner(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () => context.push(AppRoutes.premium),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [AppTheme.accentColor, AppTheme.primaryColor],
            begin: Alignment.topRight,
            end: Alignment.bottomLeft,
          ),
          borderRadius: BorderRadius.all(Radius.circular(16)),
        ),
        child: const Row(
          children: [
            Icon(Icons.workspace_premium, color: Colors.white),
            SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('الترقية المميزة', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                  SizedBox(height: 2),
                  Text('ميزات حصرية للتوافق المتقدم والبحث الذكي', style: TextStyle(color: Colors.white70, fontSize: 11)),
                ],
              ),
            ),
            Icon(Icons.chevron_left, color: Colors.white),
          ],
        ),
      ),
    );
  }

  // Saved/Memories/Archive/Interests/Events/Pages are all profile-adjacent,
  // secondary surfaces on web (a saved/collections hub, an "on this day"
  // feed, an archived-posts-and-stories hub, marriage-intent interest
  // signals, a community events hub, and a pages/organizations hub) -- none
  // of them belong on the already-packed main feed AppBar, so they're
  // grouped here instead, same placement web implies by nesting them under
  // the profile area rather than the primary nav.
  Widget _buildMenu(BuildContext context) {
    return Card(
      child: Column(
        children: [
          ListTile(
            leading: const Icon(Icons.bookmark_outline),
            title: const Text('المحفوظات'),
            trailing: const Icon(Icons.chevron_left),
            onTap: () => context.push(AppRoutes.saved),
          ),
          const Divider(height: 1),
          ListTile(
            leading: const Icon(Icons.access_time),
            title: const Text('الذكريات'),
            trailing: const Icon(Icons.chevron_left),
            onTap: () => context.push(AppRoutes.memories),
          ),
          const Divider(height: 1),
          ListTile(
            leading: const Icon(Icons.archive_outlined),
            title: const Text('الأرشيف'),
            trailing: const Icon(Icons.chevron_left),
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const ArchiveScreen()),
            ),
          ),
          const Divider(height: 1),
          ListTile(
            leading: const Icon(Icons.favorite_border),
            title: const Text('الاهتمامات'),
            trailing: const Icon(Icons.chevron_left),
            onTap: () => context.push(AppRoutes.interests),
          ),
          const Divider(height: 1),
          ListTile(
            leading: const Icon(Icons.event_outlined),
            title: const Text('الأحداث'),
            trailing: const Icon(Icons.chevron_left),
            onTap: () => context.push(AppRoutes.events),
          ),
          const Divider(height: 1),
          ListTile(
            leading: const Icon(Icons.flag_outlined),
            title: const Text('الصفحات'),
            trailing: const Icon(Icons.chevron_left),
            onTap: () => context.push(AppRoutes.pages),
          ),
          const Divider(height: 1),
          ListTile(
            leading: const Icon(Icons.share_outlined),
            title: const Text('برنامج الإحالة'),
            trailing: const Icon(Icons.chevron_left),
            onTap: () => context.push(AppRoutes.affiliates),
          ),
          // Family (guardian/ward oversight), child-prediction, and
          // lab-portal all sit at the same ordinary nav tier on web itself
          // (Sidebar.tsx/BottomNav.tsx list all three alongside e.g. Family
          // with no special marketing treatment -- only premium/upgrade gets
          // that gold-banner standout treatment there), so they're added
          // here as plain menu rows too, matching Phases 14-17's placement
          // convention for every other secondary feature.
          const Divider(height: 1),
          ListTile(
            leading: const Icon(Icons.shield_outlined),
            title: const Text('الأسرة'),
            trailing: const Icon(Icons.chevron_left),
            onTap: () => context.push(AppRoutes.family),
          ),
          const Divider(height: 1),
          ListTile(
            leading: const Icon(Icons.child_care_outlined),
            title: const Text('توقّع شكل الطفل'),
            trailing: const Icon(Icons.chevron_left),
            onTap: () => context.push(AppRoutes.childPrediction),
          ),
          const Divider(height: 1),
          ListTile(
            leading: const Icon(Icons.science_outlined),
            title: const Text('بوابة المختبرات'),
            trailing: const Icon(Icons.chevron_left),
            onTap: () => context.push(AppRoutes.labPortal),
          ),
          const Divider(height: 1),
          ListTile(
            leading: const Icon(Icons.settings_outlined),
            title: const Text('الإعدادات'),
            trailing: const Icon(Icons.chevron_left),
            onTap: () => context.push(AppRoutes.settings),
          ),
        ],
      ),
    );
  }

  Widget _buildSection(BuildContext context, String title, String content) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardTheme.color,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 4),
          Text(content, style: const TextStyle(color: AppTheme.textSecondary)),
        ],
      ),
    );
  }
}
