import 'package:image_picker/image_picker.dart';
import '../entities/profile.dart';
import '../repositories/profile_repository.dart';

class UploadAvatarUseCase {
  final ProfileRepository _repository;

  UploadAvatarUseCase(this._repository);

  Future<Profile> call(XFile file) => _repository.uploadAvatar(file);
}
