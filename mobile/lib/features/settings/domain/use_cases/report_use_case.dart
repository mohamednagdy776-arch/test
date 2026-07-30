import '../repositories/settings_repository.dart';

class ReportUseCase {
  final SettingsRepository _repository;
  const ReportUseCase(this._repository);

  Future<void> submit({
    required String type,
    required String description,
    String? email,
    List<String>? attachmentPaths,
  }) {
    return _repository.submitReport(
      type: type,
      description: description,
      email: email,
      attachmentPaths: attachmentPaths,
    );
  }
}
