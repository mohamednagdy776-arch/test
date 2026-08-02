import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/auth/domain/repositories/auth_repository.dart';
import 'package:tayyibt/features/auth/domain/use_cases/resend_verification_use_case.dart';

class MockAuthRepository extends Mock implements AuthRepository {}

void main() {
  late MockAuthRepository repository;
  late ResendVerificationUseCase useCase;

  setUp(() {
    repository = MockAuthRepository();
    useCase = ResendVerificationUseCase(repository);
  });

  test('delegates to repository.resendVerification with the given email', () async {
    when(() => repository.resendVerification(email: 'a@b.com')).thenAnswer((_) async {});

    await useCase.call(email: 'a@b.com');

    verify(() => repository.resendVerification(email: 'a@b.com')).called(1);
  });

  test('propagates repository failures', () async {
    when(() => repository.resendVerification(email: any(named: 'email')))
        .thenThrow(Exception('network error'));

    expect(() => useCase.call(email: 'a@b.com'), throwsException);
  });
}
