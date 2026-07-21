import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../constants/routes.dart';
import '../widgets/placeholder_dashboard.dart';
import '../../features/auth/presentation/providers/auth_providers.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/auth/presentation/screens/splash_screen.dart';

// Routes not registered here yet (extended-profile, feed, matching, chat,
// notifications) get added phase-by-phase as their screens are built --
// AppRoutes already defines the path constants so later phases don't need to
// touch this redirect-guard logic, just add a GoRoute + import.
const _publicPaths = {
  AppRoutes.login,
  AppRoutes.register,
  AppRoutes.forgotPassword,
  AppRoutes.resetPassword,
};

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: AppRoutes.splash,
    redirect: (context, state) async {
      final path = state.matchedLocation;
      if (path == AppRoutes.splash) return null; // SplashScreen resolves + redirects itself

      final isLoggedIn = await ref.read(authRepositoryProvider).isLoggedIn();
      final isPublic = _publicPaths.contains(path);

      if (!isLoggedIn && !isPublic) return AppRoutes.login;
      if (isLoggedIn && isPublic) return AppRoutes.dashboard;
      return null;
    },
    routes: [
      GoRoute(path: AppRoutes.splash, builder: (context, state) => const SplashScreen()),
      GoRoute(path: AppRoutes.login, builder: (context, state) => const LoginScreen()),
      GoRoute(path: AppRoutes.register, builder: (context, state) => const RegisterScreen()),
      GoRoute(path: AppRoutes.dashboard, builder: (context, state) => const PlaceholderDashboard()),
    ],
  );
});
