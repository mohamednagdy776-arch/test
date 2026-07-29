import '../entities/story.dart';
import '../repositories/stories_repository.dart';

class CreateStoryUseCase {
  final StoriesRepository _repository;
  const CreateStoryUseCase(this._repository);

  Future<Story> call({
    String? mediaUrl,
    String? mediaType,
    String? thumbnailUrl,
    String? text,
    String? bgColor,
    int? duration,
  }) {
    return _repository.createStory(
      mediaUrl: mediaUrl,
      mediaType: mediaType,
      thumbnailUrl: thumbnailUrl,
      text: text,
      bgColor: bgColor,
      duration: duration,
    );
  }
}
