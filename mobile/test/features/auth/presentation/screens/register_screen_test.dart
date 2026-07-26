import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/core/constants/routes.dart';
import 'package:tayyibt/features/auth/domain/entities/auth_tokens.dart';
import 'package:tayyibt/features/auth/domain/repositories/auth_repository.dart';
import 'package:tayyibt/features/auth/domain/use_cases/login_use_case.dart';
import 'package:tayyibt/features/auth/domain/use_cases/register_use_case.dart';
import 'package:tayyibt/features/auth/presentation/providers/auth_providers.dart';
import 'package:tayyibt/features/auth/presentation/screens/register_screen.dart';
import 'package:tayyibt/features/auth/presentation/state/auth_notifier.dart';

class MockAuthRepository extends Mock implements AuthRepository {}

Future<void> _pump(WidgetTester tester, MockAuthRepository repository) async {
  final router = GoRouter(
    initialLocation: AppRoutes.register,
    routes: [
      GoRoute(path: AppRoutes.register, builder: (context, state) => const RegisterScreen()),
      GoRoute(path: AppRoutes.dashboard, builder: (context, state) => const Scaffold(body: Text('dashboard'))),
    ],
  );

  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        authNotifierProvider.overrideWith(
          (ref) => AuthNotifier(
            loginUseCase: LoginUseCase(repository),
            registerUseCase: RegisterUseCase(repository),
            repository: repository,
          ),
        ),
      ],
      child: MaterialApp.router(routerConfig: router),
    ),
  );
  await tester.pumpAndSettle();
}

Future<void> _fillRequiredFields(WidgetTester tester) async {
  final fields = find.byType(TextFormField);
  await tester.enterText(fields.at(0), 'a@b.com'); // email
  await tester.enterText(fields.at(1), '+201234567890'); // phone
  await tester.enterText(fields.at(2), 'password123'); // password
  await tester.enterText(fields.at(3), 'password123'); // confirm password
}

void main() {
  late MockAuthRepository repository;

  setUp(() {
    repository = MockAuthRepository();
  });

  // Regression test: the backend made dateOfBirth required (issue #124)
  // after this screen was originally built, and the mobile register flow
  // never collected it -- every registration 400'd. Confirmed live via curl
  // (register without dateOfBirth -> 400, with it -> 201) while debugging a
  // user report of the sideloaded APK "not logging in".
  testWidgets('submitting without a date of birth shows a required error and never calls register', (tester) async {
    await _pump(tester, repository);
    await _fillRequiredFields(tester);

    await tester.tap(find.widgetWithText(ElevatedButton, 'Create Account'));
    await tester.pumpAndSettle();

    expect(find.text('Date of birth is required'), findsOneWidget);
    verifyNever(() => repository.register(
          email: any(named: 'email'),
          phone: any(named: 'phone'),
          password: any(named: 'password'),
          dateOfBirth: any(named: 'dateOfBirth'),
        ));
  });

  testWidgets('picking a date of birth and submitting sends it to register in YYYY-MM-DD form', (tester) async {
    when(() => repository.register(
          email: 'a@b.com',
          phone: '+201234567890',
          password: 'password123',
          dateOfBirth: any(named: 'dateOfBirth'),
        )).thenAnswer((_) async => const AuthTokens(accessToken: 'a', refreshToken: 'r'));
    await _pump(tester, repository);
    await _fillRequiredFields(tester);

    // Opens the Material date picker; the dialog's own `lastDate` already
    // excludes under-18 dates, so accepting the pre-filled initialDate (25
    // years ago) is a legitimate value without needing to navigate the grid.
    await tester.tap(find.text('Select your date of birth'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('OK'));
    await tester.pumpAndSettle();

    await tester.tap(find.widgetWithText(ElevatedButton, 'Create Account'));
    await tester.pumpAndSettle();

    final captured = verify(() => repository.register(
          email: 'a@b.com',
          phone: '+201234567890',
          password: 'password123',
          dateOfBirth: captureAny(named: 'dateOfBirth'),
        )).captured;
    expect(captured.single, matches(RegExp(r'^\d{4}-\d{2}-\d{2}$')));
    expect(find.text('dashboard'), findsOneWidget);
  });
}
