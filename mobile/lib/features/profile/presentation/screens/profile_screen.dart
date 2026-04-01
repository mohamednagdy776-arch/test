import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/profile_providers.dart';
import '../../../../core/constants/theme.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(myProfileProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: profileAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('Error: $error')),
        data: (profile) => SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              CircleAvatar(
                radius: 50,
                backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
                child: Text(
                  profile.fullName?.substring(0, 1).toUpperCase() ?? '?',
                  style: const TextStyle(fontSize: 32, color: AppTheme.primaryColor),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                profile.fullName ?? 'Unknown',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              if (profile.age != null) Text('${profile.age} years old'),
              if (profile.country != null) Text('${profile.city}, ${profile.country}'),
              const SizedBox(height: 24),
              _buildSection('About', profile.bio ?? 'No bio yet'),
              _buildSection('Religion', profile.sect ?? 'Not specified'),
              _buildSection('Education', profile.education ?? 'Not specified'),
              _buildSection('Occupation', profile.occupation ?? 'Not specified'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSection(String title, String content) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
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
