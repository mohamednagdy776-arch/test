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
import 'package:flutter/material.dart';
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

    // 'Create Account' appears twice on this screen (AppBar title AND the
    // submit button label, confirmed live on a real emulator run -- a
    // findsOneWidget assertion here fails even on a correct render). Anchor
    // to the AppBar title specifically to disambiguate.
    expect(find.widgetWithText(AppBar, 'Create Account'), findsOneWidget);
  });

  testWidgets('login shows field-level validation errors on empty submit', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: TayyibtApp()));
    await tester.pumpAndSettle(const Duration(seconds: 5));

    await tester.tap(find.widgetWithText(ElevatedButton, 'Sign In'));
    await tester.pumpAndSettle();

    expect(find.text('Email is required'), findsOneWidget);
    expect(find.text('Password is required'), findsOneWidget);
  });

  testWidgets('register shows field-level validation errors on empty submit', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: TayyibtApp()));
    await tester.pumpAndSettle(const Duration(seconds: 5));

    await tester.tap(find.text('Register'));
    await tester.pumpAndSettle();

    await tester.tap(find.widgetWithText(ElevatedButton, 'Create Account'));
    await tester.pumpAndSettle();

    expect(find.text('Email is required'), findsOneWidget);
    expect(find.text('Phone is required'), findsOneWidget);
    expect(find.text('Date of birth is required'), findsOneWidget);
    expect(find.text('Minimum 8 characters'), findsOneWidget);
  });

  testWidgets('forgot-password screen navigates and validates + renders RTL', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: TayyibtApp()));
    await tester.pumpAndSettle(const Duration(seconds: 5));

    // Login screen's link -- has a trailing Arabic '؟', distinct from the
    // forgot-password screen's own AppBar title text below (no '؟').
    await tester.tap(find.text('نسيت كلمة المرور؟'));
    await tester.pumpAndSettle();

    final titleFinder = find.text('نسيت كلمة المرور');
    expect(titleFinder, findsOneWidget);
    // App-wide mandatory RTL (locale('ar')) -- verify a real device actually
    // resolves Directionality.rtl for this screen, not just the code intent.
    expect(Directionality.of(tester.element(titleFinder)), TextDirection.rtl);

    await tester.tap(find.widgetWithText(ElevatedButton, 'إرسال'));
    await tester.pumpAndSettle();

    expect(find.text('Email is required'), findsOneWidget);
  });
}
