import '../entities/lab.dart';
import '../entities/lab_referral_code.dart';
import '../repositories/lab_portal_repository.dart';

class LabPortalUseCase {
  final LabPortalRepository _repository;
  const LabPortalUseCase(this._repository);

  Future<List<Lab>> getActiveLabs() => _repository.getActiveLabs();

  Future<List<LabReferralCode>> getMyReferrals() => _repository.getMyReferrals();

  Future<LabReferralCode> generateReferralCode(String labId) => _repository.generateReferralCode(labId);
}
