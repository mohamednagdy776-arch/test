import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../data/data_sources/profile_remote_data_source.dart';
import '../../data/repositories/profile_repository_impl.dart';
import '../../domain/entities/profile.dart';
import '../../domain/repositories/profile_repository.dart';
import '../../domain/use_cases/get_my_profile_use_case.dart';
import '../../../../core/api/dio_client.dart';

final profileRemoteDataSourceProvider = Provider((ref) {
  return ProfileRemoteDataSource(DioClient.create());
});

final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  return ProfileRepositoryImpl(ref.read(profileRemoteDataSourceProvider));
});

final getMyProfileUseCaseProvider = Provider((ref) {
  return GetMyProfileUseCase(ref.read(profileRepositoryProvider));
});

final myProfileProvider = FutureProvider<Profile>((ref) async {
  return ref.read(getMyProfileUseCaseProvider).call();
});
