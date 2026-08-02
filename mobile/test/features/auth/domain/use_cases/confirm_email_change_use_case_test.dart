import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/auth/domain/repositories/auth_repository.dart';
import 'package:tayyibt/features/auth/domain/use_cases/confirm_email_change_use_case.dart';

class MockAuthRepository extends Mock implements AuthRepository {}

void main() {
  late MockAuthRepository repository;
  late ConfirmEmailChangeUseCase useCase;

  setUp(() {
    repository = MockAuthRepository();
    useCase = ConfirmEmailChangeUseCase(repository);
  });

  test('delegates to repository.confirmEmailChange with the given token', () async {
    when(() => repository.confirmEmailChange(token: 'b' * 64)).thenAnswer((_) async {});

    await useCase.call(token: 'b' * 64);

    verify(() => repository.confirmEmailChange(token: 'b' * 64)).called(1);
  });

  test('propagates repository failures', () async {
    when(() => repository.confirmEmailChange(token: any(named: 'token')))
        .thenThrow(Exception('invalid or expired link'));

    expect(() => useCase.call(token: 'b' * 64), throwsException);
  });
}
