import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/use_cases/login_use_case.dart';
import '../../domain/use_cases/register_use_case.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../../../core/errors/failures.dart';

// Auth state
sealed class AuthState {
  const AuthState();
}
class AuthInitial extends AuthState { const AuthInitial(); }
class AuthLoading extends AuthState { const AuthLoading(); }
class AuthSuccess extends AuthState { const AuthSuccess(); }
class AuthError extends AuthState {
  final String message;
  const AuthError(this.message);
}

class AuthNotifier extends StateNotifier<AuthState> {
  final LoginUseCase loginUseCase;
  final RegisterUseCase registerUseCase;
  final AuthRepository repository;
  // Fire-and-forget FCM device-token registration -- optional so tests can
  // omit it without stubbing Firebase.
  final void Function()? onAuthenticated;

  AuthNotifier({
    required this.loginUseCase,
    required this.registerUseCase,
    required this.repository,
    this.onAuthenticated,
  }) : super(const AuthInitial());

  Future<void> login({required String email, required String password}) async {
    state = const AuthLoading();
    try {
      await loginUseCase(email: email, password: password);
      state = const AuthSuccess();
      onAuthenticated?.call();
    } on AuthFailure catch (e) {
      state = AuthError(e.message);
    } catch (_) {
      state = const AuthError('Something went wrong. Please try again.');
    }
  }

  Future<void> register({
    required String email,
    required String phone,
    required String password,
    required String dateOfBirth,
    String? referralCode,
  }) async {
    state = const AuthLoading();
    try {
      await registerUseCase(
        email: email,
        phone: phone,
        password: password,
        dateOfBirth: dateOfBirth,
        referralCode: referralCode,
      );
      state = const AuthSuccess();
      onAuthenticated?.call();
    } on AuthFailure catch (e) {
      state = AuthError(e.message);
    } catch (_) {
      state = const AuthError('Something went wrong. Please try again.');
    }
  }

  Future<void> logout() async {
    await repository.logout();
    state = const AuthInitial();
  }
}
