import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/auth/domain/entities/auth_tokens.dart';
import 'package:tayyibt/features/auth/domain/repositories/auth_repository.dart';
import 'package:tayyibt/features/auth/domain/use_cases/login_use_case.dart';

class MockAuthRepository extends Mock implements AuthRepository {}

void main() {
  late MockAuthRepository repository;
  late LoginUseCase useCase;

  setUp(() {
    repository = MockAuthRepository();
    useCase = LoginUseCase(repository);
  });

  test('delegates to repository.login and returns the tokens', () async {
    const tokens = AuthTokens(accessToken: 'a', refreshToken: 'r');
    when(() => repository.login(email: 'a@b.com', password: 'pw123456')).thenAnswer((_) async => tokens);

    final result = await useCase.call(email: 'a@b.com', password: 'pw123456');

    expect(result, tokens);
    verify(() => repository.login(email: 'a@b.com', password: 'pw123456')).called(1);
  });

  test('propagates repository failures', () async {
    when(() => repository.login(email: any(named: 'email'), password: any(named: 'password')))
        .thenThrow(Exception('invalid credentials'));

    expect(() => useCase.call(email: 'a@b.com', password: 'wrong'), throwsException);
  });
}
