import '../../domain/entities/lab.dart';
import '../../domain/entities/lab_referral_code.dart';
import '../../domain/repositories/lab_portal_repository.dart';
import '../data_sources/lab_portal_remote_data_source.dart';

class LabPortalRepositoryImpl implements LabPortalRepository {
  final LabPortalRemoteDataSource _remoteDataSource;
  const LabPortalRepositoryImpl(this._remoteDataSource);

  @override
  Future<List<Lab>> getActiveLabs() async {
    final list = await _remoteDataSource.getActiveLabs();
    return list.map((e) => Lab.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<List<LabReferralCode>> getMyReferrals() async {
    final list = await _remoteDataSource.getMyReferrals();
    return list.map((e) => LabReferralCode.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<LabReferralCode> generateReferralCode(String labId) async {
    final json = await _remoteDataSource.generateReferralCode(labId);
    return LabReferralCode.fromJson(json);
  }
}
