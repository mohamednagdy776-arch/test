import '../../../posts/domain/entities/post.dart';
import '../../domain/repositories/memories_repository.dart';
import '../data_sources/memories_remote_data_source.dart';

class MemoriesRepositoryImpl implements MemoriesRepository {
  final MemoriesRemoteDataSource _remote;
  const MemoriesRepositoryImpl(this._remote);

  @override
  Future<List<Post>> getMemories() async {
    final items = await _remote.getMemories();
    return items.map(Post.fromJson).toList();
  }
}
