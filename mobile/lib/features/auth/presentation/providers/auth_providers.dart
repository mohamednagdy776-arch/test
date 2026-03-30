import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../../core/api/dio_client.dart';
import '../../data/data_sources/auth_remote_data_source.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/use_cases/login_use_case.dart';
import '../../domain/use_cases/register_use_case.dart';
import '../state/auth_notifier.dart';

final _storageProvider = Provider((_) => const FlutterSecureStorage());
final _dioProvider = Provider((_) => DioClient.create());

final _remoteDataSourceProvider = Provider(
  (ref) => AuthRemoteDataSource(ref.read(_dioProvider)),
);

final authRepositoryProvider = Provider<AuthRepository>(
  (ref) => AuthRepositoryImpl(
    remoteDataSource: ref.read(_remoteDataSourceProvider),
    storage: ref.read(_storageProvider),
  ),
);

final authNotifierProvider = StateNotifierProvider<AuthNotifier, AuthState>(
  (ref) => AuthNotifier(
    loginUseCase: LoginUseCase(ref.read(authRepositoryProvider)),
    registerUseCase: RegisterUseCase(ref.read(authRepositoryProvider)),
    repository: ref.read(authRepositoryProvider),
  ),
);

// Check if user is already logged in (for splash screen)
final isLoggedInProvider = FutureProvider<bool>(
  (ref) => ref.read(authRepositoryProvider).isLoggedIn(),
);
