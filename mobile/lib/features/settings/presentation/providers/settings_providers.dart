import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/data_sources/settings_remote_data_source.dart';
import '../../data/repositories/settings_repository_impl.dart';
import '../../domain/repositories/settings_repository.dart';
import '../../domain/use_cases/privacy_use_case.dart';
import '../../domain/use_cases/appearance_use_case.dart';
import '../../domain/use_cases/notifications_settings_use_case.dart';
import '../../domain/use_cases/security_use_case.dart';
import '../../domain/use_cases/email_use_case.dart';
import '../../domain/use_cases/consent_use_case.dart';
import '../../domain/use_cases/verification_use_case.dart';
import '../../domain/use_cases/report_use_case.dart';
import '../../../../core/api/dio_client.dart';

final settingsRemoteDataSourceProvider = Provider((ref) {
  return SettingsRemoteDataSource(DioClient.create());
});

final settingsRepositoryProvider = Provider<SettingsRepository>((ref) {
  return SettingsRepositoryImpl(ref.read(settingsRemoteDataSourceProvider));
});

final privacyUseCaseProvider = Provider((ref) {
  return PrivacyUseCase(ref.read(settingsRepositoryProvider));
});

final appearanceUseCaseProvider = Provider((ref) {
  return AppearanceUseCase(ref.read(settingsRepositoryProvider));
});

final notificationsSettingsUseCaseProvider = Provider((ref) {
  return NotificationsSettingsUseCase(ref.read(settingsRepositoryProvider));
});

final securityUseCaseProvider = Provider((ref) {
  return SecurityUseCase(ref.read(settingsRepositoryProvider));
});

final emailUseCaseProvider = Provider((ref) {
  return EmailUseCase(ref.read(settingsRepositoryProvider));
});

final consentUseCaseProvider = Provider((ref) {
  return ConsentUseCase(ref.read(settingsRepositoryProvider));
});

final verificationUseCaseProvider = Provider((ref) {
  return VerificationUseCase(ref.read(settingsRepositoryProvider));
});

final reportUseCaseProvider = Provider((ref) {
  return ReportUseCase(ref.read(settingsRepositoryProvider));
});
