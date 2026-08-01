import 'package:image_picker/image_picker.dart';
import '../entities/post.dart';
import '../entities/poll_option.dart';
import '../repositories/posts_repository.dart';

class CreatePostUseCase {
  final PostsRepository _repository;
  const CreatePostUseCase(this._repository);

  Future<Post> call({
    required String content,
    XFile? image,
    String? bgColor,
    String? feeling,
    String? location,
    String? audience,
    List<PollOption>? pollOptions,
  }) {
    return _repository.createPost(
      content: content,
      image: image,
      bgColor: bgColor,
      feeling: feeling,
      location: location,
      audience: audience,
      pollOptions: pollOptions,
    );
  }
}
