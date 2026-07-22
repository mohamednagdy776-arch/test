import 'package:image_picker/image_picker.dart';
import '../entities/post.dart';
import '../repositories/posts_repository.dart';

class CreatePostUseCase {
  final PostsRepository _repository;
  const CreatePostUseCase(this._repository);

  Future<Post> call({required String content, XFile? image}) {
    return _repository.createPost(content: content, image: image);
  }
}
