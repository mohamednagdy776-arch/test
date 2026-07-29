import 'package:image_picker/image_picker.dart';
import '../../../../core/api/api_response.dart';
import '../../domain/entities/story.dart';
import '../../domain/repositories/stories_repository.dart';
import '../data_sources/stories_remote_data_source.dart';

class StoriesRepositoryImpl implements StoriesRepository {
  final StoriesRemoteDataSource _remoteDataSource;
  const StoriesRepositoryImpl(this._remoteDataSource);

  @override
  Future<List<StoryGroup>> getStories() async {
    final data = await _remoteDataSource.getStories();
    return data.map(StoryGroup.fromJson).toList();
  }

  @override
  Future<PaginatedResult<Story>> getArchivedStories({int page = 1, int limit = 10}) async {
    final result = await _remoteDataSource.getArchivedStories(page: page, limit: limit);
    return PaginatedResult<Story>(
      items: result.items.map(Story.fromJson).toList(),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    );
  }

  @override
  Future<String> uploadMedia(XFile file) => _remoteDataSource.uploadMedia(file);

  @override
  Future<Story> createStory({
    String? mediaUrl,
    String? mediaType,
    String? thumbnailUrl,
    String? text,
    String? bgColor,
    int? duration,
  }) async {
    final data = await _remoteDataSource.createStory(
      mediaUrl: mediaUrl,
      mediaType: mediaType,
      thumbnailUrl: thumbnailUrl,
      text: text,
      bgColor: bgColor,
      duration: duration,
    );
    return Story.fromJson(data);
  }

  @override
  Future<void> deleteStory(String storyId) =>
      _remoteDataSource.deleteStory(storyId);

  @override
  Future<void> viewStory(String storyId) =>
      _remoteDataSource.viewStory(storyId);

  @override
  Future<Story> getStory(String storyId) async {
    final data = await _remoteDataSource.getStory(storyId);
    return Story.fromJson(data);
  }

  @override
  Future<List<StoryViewer>> getStoryViewers(String storyId) async {
    final data = await _remoteDataSource.getStoryViewers(storyId);
    return data.map(StoryViewer.fromJson).toList();
  }

  @override
  Future<Story> toggleArchiveStory(String storyId) async {
    final data = await _remoteDataSource.toggleArchiveStory(storyId);
    return Story.fromJson(data);
  }

  @override
  Future<void> reactToStory(String storyId, String emoji) =>
      _remoteDataSource.reactToStory(storyId, emoji);
}
