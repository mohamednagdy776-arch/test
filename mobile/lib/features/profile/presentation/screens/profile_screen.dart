import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../providers/profile_providers.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/constants/routes.dart';
import '../../../../core/utils/media.dart';

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
            ],
          ),
        ),
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
