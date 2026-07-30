import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../constants/routes.dart';
import '../../features/auth/presentation/providers/auth_providers.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/auth/presentation/screens/forgot_password_screen.dart';
import '../../features/auth/presentation/screens/reset_password_screen.dart';
import '../../features/auth/presentation/screens/splash_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';
import '../../features/profile/presentation/screens/extended_profile_screen.dart';
import '../../features/posts/presentation/screens/feed_screen.dart';
import '../../features/matching/presentation/screens/matches_screen.dart';
import '../../features/chat/presentation/screens/conversations_screen.dart';
import '../../features/notifications/presentation/screens/notifications_screen.dart';
import '../../features/friends/presentation/screens/friends_screen.dart';
import '../../features/search/presentation/screens/search_screen.dart';
import '../../features/groups/presentation/screens/groups_screen.dart';
import '../../features/videos/presentation/screens/reels_screen.dart';
import '../../features/videos/presentation/screens/watch_screen.dart';
import '../../features/videos/presentation/screens/video_upload_screen.dart';
import '../../features/saved/presentation/screens/saved_screen.dart';
import '../../features/memories/presentation/screens/memories_screen.dart';
import '../../features/interests/presentation/screens/interests_screen.dart';
import '../../features/events/presentation/screens/events_screen.dart';
import '../../features/pages/presentation/screens/pages_screen.dart';
import '../../features/settings/presentation/screens/settings_screen.dart';
import '../../features/settings/presentation/screens/account_settings_screen.dart';
import '../../features/settings/presentation/screens/security_settings_screen.dart';
import '../../features/settings/presentation/screens/email_settings_screen.dart';
import '../../features/settings/presentation/screens/privacy_settings_screen.dart';
import '../../features/settings/presentation/screens/appearance_settings_screen.dart';
import '../../features/settings/presentation/screens/notifications_settings_screen.dart';
import '../../features/settings/presentation/screens/consent_settings_screen.dart';
import '../../features/settings/presentation/screens/verification_settings_screen.dart';
import '../../features/settings/presentation/screens/report_settings_screen.dart';

// Match detail, chat thread, and group detail aren't GoRoutes at all (pushed
// directly with the already-fetched id, same pattern as
// create_post_screen.dart) -- no re-fetch-by-id needed.
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
      GoRoute(path: AppRoutes.forgotPassword, builder: (context, state) => const ForgotPasswordScreen()),
      GoRoute(path: AppRoutes.resetPassword, builder: (context, state) => const ResetPasswordScreen()),
      GoRoute(path: AppRoutes.dashboard, builder: (context, state) => const FeedScreen()),
      GoRoute(path: AppRoutes.profile, builder: (context, state) => const ProfileScreen()),
      GoRoute(path: AppRoutes.extendedProfile, builder: (context, state) => const ExtendedProfileScreen()),
      GoRoute(path: AppRoutes.matching, builder: (context, state) => const MatchesScreen()),
      GoRoute(path: AppRoutes.chat, builder: (context, state) => const ConversationsScreen()),
      GoRoute(path: AppRoutes.notifications, builder: (context, state) => const NotificationsScreen()),
      GoRoute(path: AppRoutes.friends, builder: (context, state) => const FriendsScreen()),
      GoRoute(path: AppRoutes.search, builder: (context, state) => const SearchScreen()),
      GoRoute(path: AppRoutes.groups, builder: (context, state) => const GroupsScreen()),
      GoRoute(path: AppRoutes.reels, builder: (context, state) => const ReelsScreen()),
      GoRoute(path: AppRoutes.watch, builder: (context, state) => const WatchScreen()),
      // Reels/Watch's own upload buttons push VideoUploadScreen directly
      // (Navigator.push) so they can pass isReel without a query-param
      // round trip; this GoRoute exists so /videos/upload is still directly
      // reachable/deep-linkable, defaulting to a Watch (non-reel) upload.
      GoRoute(path: AppRoutes.videoUpload, builder: (context, state) => const VideoUploadScreen(isReel: false)),
      GoRoute(path: AppRoutes.saved, builder: (context, state) => const SavedScreen()),
      GoRoute(path: AppRoutes.memories, builder: (context, state) => const MemoriesScreen()),
      GoRoute(path: AppRoutes.interests, builder: (context, state) => const InterestsScreen()),
      GoRoute(path: AppRoutes.events, builder: (context, state) => const EventsScreen()),
      GoRoute(path: AppRoutes.pages, builder: (context, state) => const PagesScreen()),
      GoRoute(path: AppRoutes.settings, builder: (context, state) => const SettingsScreen()),
      GoRoute(path: AppRoutes.settingsAccount, builder: (context, state) => const AccountSettingsScreen()),
      GoRoute(path: AppRoutes.settingsSecurity, builder: (context, state) => const SecuritySettingsScreen()),
      GoRoute(path: AppRoutes.settingsEmail, builder: (context, state) => const EmailSettingsScreen()),
      GoRoute(path: AppRoutes.settingsPrivacy, builder: (context, state) => const PrivacySettingsScreen()),
      GoRoute(path: AppRoutes.settingsAppearance, builder: (context, state) => const AppearanceSettingsScreen()),
      GoRoute(path: AppRoutes.settingsNotifications, builder: (context, state) => const NotificationsSettingsScreen()),
      GoRoute(path: AppRoutes.settingsConsent, builder: (context, state) => const ConsentSettingsScreen()),
      GoRoute(path: AppRoutes.settingsVerification, builder: (context, state) => const VerificationSettingsScreen()),
      GoRoute(path: AppRoutes.settingsReport, builder: (context, state) => const ReportSettingsScreen()),
    ],
  );
});
