import 'package:image_picker/image_picker.dart';
import '../entities/profile.dart';

abstract class ProfileRepository {
  Future<Profile> getMyProfile();
  Future<Profile> updateProfile(Map<String, dynamic> data);
  Future<Profile> getUserProfile(String userId);
  // XFile (not dart:io.File) -- must work on web too, not just mobile.
  Future<Profile> uploadAvatar(XFile file);
}
