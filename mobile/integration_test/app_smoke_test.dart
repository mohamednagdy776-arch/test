// Real-emulator smoke test -- runs on an actually-booted Android AVD in CI
// (see .github/workflows/mobile-ci.yml's mobile-android-emulator job), unlike
// the rest of test/ which runs in the headless widget-test harness. Closes
// the "never had a device" verification gap: this exercises real app
// bootstrap, real navigation, and real rendering on a virtual device.
//
// Deliberately does NOT touch the live backend (no login attempt): the
// shared @tayyibt.test QA accounts have already hit real rate-limit/2FA
// lockouts during manual QA (see memory tayyibt-qa-test-accounts.md), and
// this job would run that risk on every single push. Boot + pure client-side
// navigation is enough to prove the app actually renders on a device.
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:tayyibt/main.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('app boots to login screen and navigates to register', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: TayyibtApp()));

    // Splash resolves isLoggedInProvider (false, fresh install/no token) and
    // redirects -- pump past the post-frame callback + router transition.
    await tester.pumpAndSettle(const Duration(seconds: 5));

    expect(find.text('Tayyibt'), findsOneWidget);
    expect(find.text('Sign In'), findsOneWidget);

    await tester.tap(find.text('Register'));
    await tester.pumpAndSettle();

    expect(find.text('Create Account'), findsOneWidget);
  });
}
