import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/data_sources/affiliates_remote_data_source.dart';
import '../../data/repositories/affiliates_repository_impl.dart';
import '../../domain/repositories/affiliates_repository.dart';
import '../../domain/use_cases/affiliates_use_case.dart';
import '../state/affiliates_notifier.dart';
import '../state/affiliates_state.dart';
import '../../../../core/api/dio_client.dart';

final affiliatesRemoteDataSourceProvider = Provider((ref) {
  return AffiliatesRemoteDataSource(DioClient.create());
});

final affiliatesRepositoryProvider = Provider<AffiliatesRepository>((ref) {
  return AffiliatesRepositoryImpl(ref.read(affiliatesRemoteDataSourceProvider));
});

final affiliatesUseCaseProvider = Provider((ref) {
  return AffiliatesUseCase(ref.read(affiliatesRepositoryProvider));
});

final affiliatesProvider = StateNotifierProvider<AffiliatesNotifier, AffiliatesState>((ref) {
  return AffiliatesNotifier(ref.read(affiliatesUseCaseProvider));
});
