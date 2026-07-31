import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/data_sources/lab_portal_remote_data_source.dart';
import '../../data/repositories/lab_portal_repository_impl.dart';
import '../../domain/repositories/lab_portal_repository.dart';
import '../../domain/use_cases/lab_portal_use_case.dart';
import '../state/lab_portal_notifier.dart';
import '../state/lab_portal_state.dart';
import '../../../../core/api/dio_client.dart';

final labPortalRemoteDataSourceProvider = Provider((ref) {
  return LabPortalRemoteDataSource(DioClient.create());
});

final labPortalRepositoryProvider = Provider<LabPortalRepository>((ref) {
  return LabPortalRepositoryImpl(ref.read(labPortalRemoteDataSourceProvider));
});

final labPortalUseCaseProvider = Provider((ref) {
  return LabPortalUseCase(ref.read(labPortalRepositoryProvider));
});

final labPortalProvider = StateNotifierProvider<LabPortalNotifier, LabPortalState>((ref) {
  return LabPortalNotifier(ref.read(labPortalUseCaseProvider));
});
