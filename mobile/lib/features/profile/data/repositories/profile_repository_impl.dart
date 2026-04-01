import '../../domain/entities/profile.dart';
import '../../domain/repositories/profile_repository.dart';
import '../data_sources/profile_remote_data_source.dart';

class ProfileRepositoryImpl implements ProfileRepository {
  final ProfileRemoteDataSource _remoteDataSource;

  ProfileRepositoryImpl(this._remoteDataSource);

  @override
  Future<Profile> getMyProfile() async {
    final data = await _remoteDataSource.getMyProfile();
    return Profile.fromJson(data);
  }

  @override
  Future<Profile> updateProfile(Map<String, dynamic> data) async {
    final result = await _remoteDataSource.updateProfile(data);
    return Profile.fromJson(result);
  }

  @override
  Future<Profile> getUserProfile(String userId) async {
    final data = await _remoteDataSource.getUserProfile(userId);
    return Profile.fromJson(data);
  }
}
