import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/auth/domain/entities/auth_tokens.dart';
import 'package:tayyibt/features/auth/domain/repositories/auth_repository.dart';
import 'package:tayyibt/features/auth/domain/use_cases/register_use_case.dart';

class MockAuthRepository extends Mock implements AuthRepository {}

void main() {
  late MockAuthRepository repository;
  late RegisterUseCase useCase;

  setUp(() {
    repository = MockAuthRepository();
    useCase = RegisterUseCase(repository);
  });

  test('delegates to repository.register and returns the tokens', () async {
    const tokens = AuthTokens(accessToken: 'a', refreshToken: 'r');
    when(() => repository.register(email: 'a@b.com', phone: '+201000000000', password: 'pw123456'))
        .thenAnswer((_) async => tokens);

    final result = await useCase.call(email: 'a@b.com', phone: '+201000000000', password: 'pw123456');

    expect(result, tokens);
    verify(() => repository.register(email: 'a@b.com', phone: '+201000000000', password: 'pw123456')).called(1);
  });

  test('propagates repository failures', () async {
    when(() => repository.register(
          email: any(named: 'email'),
          phone: any(named: 'phone'),
          password: any(named: 'password'),
        )).thenThrow(Exception('email already registered'));

    expect(
      () => useCase.call(email: 'a@b.com', phone: '+201000000000', password: 'pw123456'),
      throwsException,
    );
  });
}
