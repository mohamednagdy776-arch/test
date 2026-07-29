import 'package:image_picker/image_picker.dart';
import '../repositories/videos_repository.dart';

class UploadVideoMediaUseCase {
  final VideosRepository _repository;
  const UploadVideoMediaUseCase(this._repository);

  Future<String> call(XFile file) => _repository.uploadMedia(file);
}
