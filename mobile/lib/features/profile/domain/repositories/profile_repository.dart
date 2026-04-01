import '../entities/profile.dart';

abstract class ProfileRepository {
  Future<Profile> getMyProfile();
  Future<Profile> updateProfile(Map<String, dynamic> data);
  Future<Profile> getUserProfile(String userId);
}
