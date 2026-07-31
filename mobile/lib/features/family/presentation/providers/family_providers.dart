import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/data_sources/family_remote_data_source.dart';
import '../../data/repositories/family_repository_impl.dart';
import '../../domain/repositories/family_repository.dart';
import '../../domain/use_cases/family_use_case.dart';
import '../state/family_notifier.dart';
import '../state/family_state.dart';
import '../../../../core/api/dio_client.dart';

final familyRemoteDataSourceProvider = Provider((ref) {
  return FamilyRemoteDataSource(DioClient.create());
});

final familyRepositoryProvider = Provider<FamilyRepository>((ref) {
  return FamilyRepositoryImpl(ref.read(familyRemoteDataSourceProvider));
});

final familyUseCaseProvider = Provider((ref) {
  return FamilyUseCase(ref.read(familyRepositoryProvider));
});

final familyProvider = StateNotifierProvider<FamilyRelationshipsNotifier, FamilyState>((ref) {
  return FamilyRelationshipsNotifier(ref.read(familyUseCaseProvider));
});
