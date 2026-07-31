import '../entities/report_reason.dart';
import '../repositories/profile_repository.dart';

class ReportUserUseCase {
  final ProfileRepository _repository;
  const ReportUserUseCase(this._repository);

  Future<void> call(String userId, String reason, String? details) =>
      _repository.reportUser(userId, reason, details);

  Future<List<ReportReason>> reasons() => _repository.getReportReasons();
}
