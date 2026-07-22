import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/auth/domain/repositories/auth_repository.dart';
import 'package:tayyibt/features/auth/domain/use_cases/reset_password_use_case.dart';

class MockAuthRepository extends Mock implements AuthRepository {}

void main() {
  late MockAuthRepository repository;
  late ResetPasswordUseCase useCase;

  setUp(() {
    repository = MockAuthRepository();
    useCase = ResetPasswordUseCase(repository);
  });

  test('delegates to repository.resetPassword with token and password', () async {
    when(() => repository.resetPassword(token: 'abc123', password: 'Str0ng!Pass'))
        .thenAnswer((_) async {});

    await useCase.call(token: 'abc123', password: 'Str0ng!Pass');

    verify(() => repository.resetPassword(token: 'abc123', password: 'Str0ng!Pass')).called(1);
  });

  test('propagates repository failures', () async {
    when(() => repository.resetPassword(
          token: any(named: 'token'),
          password: any(named: 'password'),
        )).thenThrow(Exception('invalid token'));

    expect(() => useCase.call(token: 'abc123', password: 'Str0ng!Pass'), throwsException);
  });
}
