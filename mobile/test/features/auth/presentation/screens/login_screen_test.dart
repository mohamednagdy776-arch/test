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
import 'package:tayyibt/features/auth/presentation/screens/login_screen.dart';
import 'package:tayyibt/features/auth/presentation/state/auth_notifier.dart';

class MockAuthRepository extends Mock implements AuthRepository {}

Future<void> _pump(WidgetTester tester, MockAuthRepository repository) async {
  final router = GoRouter(
    initialLocation: AppRoutes.login,
    routes: [
      GoRoute(path: AppRoutes.login, builder: (context, state) => const LoginScreen()),
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

void main() {
  late MockAuthRepository repository;

  setUp(() {
    repository = MockAuthRepository();
  });

  testWidgets('submitting an empty form shows required-field errors and never calls login', (tester) async {
    await _pump(tester, repository);

    await tester.tap(find.widgetWithText(ElevatedButton, 'Sign In'));
    await tester.pumpAndSettle();

    expect(find.text('Email is required'), findsOneWidget);
    expect(find.text('Password is required'), findsOneWidget);
    verifyNever(() => repository.login(email: any(named: 'email'), password: any(named: 'password')));
  });

  testWidgets('an invalid email shows a format error', (tester) async {
    await _pump(tester, repository);

    // AuthTextField renders its label as a sibling Text, not a descendant of
    // the TextFormField, so fields are targeted by form order (email, then
    // password) instead of widgetWithText.
    final fields = find.byType(TextFormField);
    await tester.enterText(fields.at(0), 'not-an-email');
    await tester.enterText(fields.at(1), 'password123');
    await tester.tap(find.widgetWithText(ElevatedButton, 'Sign In'));
    await tester.pumpAndSettle();

    expect(find.text('Enter a valid email'), findsOneWidget);
    verifyNever(() => repository.login(email: any(named: 'email'), password: any(named: 'password')));
  });

  testWidgets('a short password shows a minimum-length error', (tester) async {
    await _pump(tester, repository);

    final fields = find.byType(TextFormField);
    await tester.enterText(fields.at(0), 'a@b.com');
    await tester.enterText(fields.at(1), 'short');
    await tester.tap(find.widgetWithText(ElevatedButton, 'Sign In'));
    await tester.pumpAndSettle();

    expect(find.text('Minimum 8 characters'), findsOneWidget);
    verifyNever(() => repository.login(email: any(named: 'email'), password: any(named: 'password')));
  });

  testWidgets('valid credentials submit and navigate to the dashboard on success', (tester) async {
    when(() => repository.login(email: 'a@b.com', password: 'password123'))
        .thenAnswer((_) async => const AuthTokens(accessToken: 'a', refreshToken: 'r'));
    await _pump(tester, repository);

    final fields = find.byType(TextFormField);
    await tester.enterText(fields.at(0), 'a@b.com');
    await tester.enterText(fields.at(1), 'password123');
    await tester.tap(find.widgetWithText(ElevatedButton, 'Sign In'));
    await tester.pumpAndSettle();

    verify(() => repository.login(email: 'a@b.com', password: 'password123')).called(1);
    expect(find.text('dashboard'), findsOneWidget);
  });
}
