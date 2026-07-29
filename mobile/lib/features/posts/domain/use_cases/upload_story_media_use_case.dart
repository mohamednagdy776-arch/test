import 'package:image_picker/image_picker.dart';
import '../repositories/stories_repository.dart';

class UploadStoryMediaUseCase {
  final StoriesRepository _repository;
  const UploadStoryMediaUseCase(this._repository);

  Future<String> call(XFile file) => _repository.uploadMedia(file);
}
