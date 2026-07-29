import 'package:image_picker/image_picker.dart';
import '../../../../core/api/api_response.dart';
import '../entities/story.dart';

abstract class StoriesRepository {
  Future<List<StoryGroup>> getStories();

  Future<PaginatedResult<Story>> getArchivedStories({int page = 1, int limit = 10});

  /// Uploads a raw image/video file and returns its resolvable media URL.
  Future<String> uploadMedia(XFile file);

  Future<Story> createStory({
    String? mediaUrl,
    String? mediaType,
    String? thumbnailUrl,
    String? text,
    String? bgColor,
    int? duration,
  });

  Future<void> deleteStory(String storyId);
  Future<void> viewStory(String storyId);
  Future<Story> getStory(String storyId);
  Future<List<StoryViewer>> getStoryViewers(String storyId);

  /// Returns the updated story (toggles archive <-> unarchive).
  Future<Story> toggleArchiveStory(String storyId);
  Future<void> reactToStory(String storyId, String emoji);
}
