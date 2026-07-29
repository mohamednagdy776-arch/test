import '../../../posts/domain/entities/post.dart';
import '../repositories/memories_repository.dart';

class GetMemoriesUseCase {
  final MemoriesRepository _repository;
  const GetMemoriesUseCase(this._repository);

  Future<List<Post>> call() => _repository.getMemories();
}
