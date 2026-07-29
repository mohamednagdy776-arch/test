import '../../../posts/domain/entities/post.dart';

abstract class MemoriesRepository {
  /// GET /memories -- "on this day" style feed of the user's own past posts.
  Future<List<Post>> getMemories();
}
