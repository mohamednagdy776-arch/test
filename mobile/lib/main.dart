import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/constants/routes.dart';
import 'features/auth/presentation/screens/login_screen.dart';
import 'features/auth/presentation/screens/register_screen.dart';
import 'features/auth/presentation/providers/auth_providers.dart';

void main() {
  runApp(const ProviderScope(child: TayyibtApp()));
}

class TayyibtApp extends StatelessWidget {
  const TayyibtApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Tayyibt',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF1a56db)),
        useMaterial3: true,
        fontFamily: 'Roboto',
      ),
      initialRoute: AppRoutes.splash,
      routes: {
        AppRoutes.splash: (ctx) => const SplashScreen(),
        AppRoutes.login: (ctx) => const LoginScreen(),
        AppRoutes.register: (ctx) => const RegisterScreen(),
        AppRoutes.dashboard: (ctx) => const PlaceholderDashboard(),
      },
    );
  }
}

// Splash — checks token and routes accordingly
class SplashScreen extends ConsumerWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLoggedIn = ref.watch(isLoggedInProvider);

    return isLoggedIn.when(
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      ),
      error: (_, __) => const LoginScreen(),
      data: (loggedIn) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          Navigator.pushReplacementNamed(
            context,
            loggedIn ? AppRoutes.dashboard : AppRoutes.login,
          );
        });
        return const Scaffold(body: Center(child: CircularProgressIndicator()));
      },
    );
  }
}

// Placeholder until full dashboard is built
class PlaceholderDashboard extends ConsumerWidget {
  const PlaceholderDashboard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tayyibt'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await ref.read(authRepositoryProvider).logout();
              if (context.mounted) {
                Navigator.pushReplacementNamed(context, AppRoutes.login);
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
