import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/auth/domain/repositories/auth_repository.dart';
import 'package:tayyibt/features/auth/domain/use_cases/verify_email_use_case.dart';

class MockAuthRepository extends Mock implements AuthRepository {}

void main() {
  late MockAuthRepository repository;
  late VerifyEmailUseCase useCase;

  setUp(() {
    repository = MockAuthRepository();
    useCase = VerifyEmailUseCase(repository);
  });

  test('delegates to repository.verifyEmail with the given token', () async {
    when(() => repository.verifyEmail(token: 'a' * 64)).thenAnswer((_) async {});

    await useCase.call(token: 'a' * 64);

    verify(() => repository.verifyEmail(token: 'a' * 64)).called(1);
  });

  test('propagates repository failures', () async {
    when(() => repository.verifyEmail(token: any(named: 'token')))
        .thenThrow(Exception('invalid token'));

    expect(() => useCase.call(token: 'a' * 64), throwsException);
  });
}
