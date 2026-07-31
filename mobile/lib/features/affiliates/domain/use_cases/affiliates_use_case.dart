import '../entities/affiliate.dart';
import '../entities/affiliate_referral.dart';
import '../repositories/affiliates_repository.dart';

class AffiliatesUseCase {
  final AffiliatesRepository _repository;
  const AffiliatesUseCase(this._repository);

  Future<Affiliate?> getMyAffiliate() => _repository.getMyAffiliate();

  Future<List<AffiliateReferral>> getReferrals() => _repository.getReferrals();

  Future<Affiliate> joinAsAffiliate({String? referralCode}) =>
      _repository.joinAsAffiliate(referralCode: referralCode);

  Future<Affiliate?> validateReferralCode(String code) => _repository.validateReferralCode(code);
}
