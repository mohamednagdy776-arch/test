import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/routes.dart';
import '../providers/auth_providers.dart';

// Checks token state once and hands off to the router redirect.
class SplashScreen extends ConsumerWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLoggedIn = ref.watch(isLoggedInProvider);

    return isLoggedIn.when(
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      ),
      error: (_, __) => const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      ),
      data: (loggedIn) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (context.mounted) {
            context.go(loggedIn ? AppRoutes.dashboard : AppRoutes.login);
          }
        });
        return const Scaffold(body: Center(child: CircularProgressIndicator()));
      },
    );
  }
}
