import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/auth/domain/repositories/auth_repository.dart';
import 'package:tayyibt/features/auth/domain/use_cases/forgot_password_use_case.dart';

class MockAuthRepository extends Mock implements AuthRepository {}

void main() {
  late MockAuthRepository repository;
  late ForgotPasswordUseCase useCase;

  setUp(() {
    repository = MockAuthRepository();
    useCase = ForgotPasswordUseCase(repository);
  });

  test('delegates to repository.forgotPassword with the given email', () async {
    when(() => repository.forgotPassword(email: 'a@b.com')).thenAnswer((_) async {});

    await useCase.call(email: 'a@b.com');

    verify(() => repository.forgotPassword(email: 'a@b.com')).called(1);
  });

  test('propagates repository failures', () async {
    when(() => repository.forgotPassword(email: any(named: 'email')))
        .thenThrow(Exception('network error'));

    expect(() => useCase.call(email: 'a@b.com'), throwsException);
  });
}
