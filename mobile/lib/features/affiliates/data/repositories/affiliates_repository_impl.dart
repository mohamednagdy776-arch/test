import '../../domain/entities/affiliate.dart';
import '../../domain/entities/affiliate_referral.dart';
import '../../domain/repositories/affiliates_repository.dart';
import '../data_sources/affiliates_remote_data_source.dart';

class AffiliatesRepositoryImpl implements AffiliatesRepository {
  final AffiliatesRemoteDataSource _remoteDataSource;
  const AffiliatesRepositoryImpl(this._remoteDataSource);

  @override
  Future<Affiliate?> getMyAffiliate() async {
    final json = await _remoteDataSource.getMyAffiliate();
    return json == null ? null : Affiliate.fromJson(json);
  }

  @override
  Future<List<AffiliateReferral>> getReferrals() async {
    final list = await _remoteDataSource.getReferrals();
    return list.map((e) => AffiliateReferral.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<Affiliate> joinAsAffiliate({String? referralCode}) async {
    final json = await _remoteDataSource.joinAsAffiliate(referralCode: referralCode);
    return Affiliate.fromJson(json);
  }

  @override
  Future<Affiliate?> validateReferralCode(String code) async {
    final json = await _remoteDataSource.validateReferralCode(code);
    return json == null ? null : Affiliate.fromJson(json);
  }
}
