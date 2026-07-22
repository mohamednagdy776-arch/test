import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../constants/routes.dart';
import '../../features/auth/presentation/providers/auth_providers.dart';

// Temporary landing screen until Phase 4 (feed) replaces it with the real
// dashboard/feed_screen.dart.
class PlaceholderDashboard extends ConsumerWidget {
  const PlaceholderDashboard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tayyibt'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () => context.push(AppRoutes.profile),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await ref.read(authRepositoryProvider).logout();
              if (context.mounted) {
                context.go(AppRoutes.login);
              }
            },
          ),
        ],
      ),
      body: const Center(
        child: Text('Welcome to Tayyibt 🎉', style: TextStyle(fontSize: 20)),
      ),
    );
  }
}
