import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/use_cases/get_stories_use_case.dart';
import '../../domain/use_cases/create_story_use_case.dart';
import '../../domain/use_cases/delete_story_use_case.dart';
import 'stories_state.dart';

class StoriesNotifier extends StateNotifier<StoriesState> {
  final GetStoriesUseCase _getStories;
  final CreateStoryUseCase _createStory;
  final DeleteStoryUseCase _deleteStory;

  // No auto-load-on-construct -- same convention as FeedNotifier: the
  // widget's initState kicks off loadInitial() via Future.microtask.
  StoriesNotifier(this._getStories, this._createStory, this._deleteStory)
      : super(const StoriesState());

  Future<void> loadInitial() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final groups = await _getStories();
      state = state.copyWith(groups: groups, isLoading: false);
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'فشل تحميل القصص');
    }
  }

  Future<void> refresh() => loadInitial();

  Future<void> createStory({
    String? mediaUrl,
    String? mediaType,
    String? thumbnailUrl,
    String? text,
    String? bgColor,
    int? duration,
  }) async {
    await _createStory(
      mediaUrl: mediaUrl,
      mediaType: mediaType,
      thumbnailUrl: thumbnailUrl,
      text: text,
      bgColor: bgColor,
      duration: duration,
    );
    await loadInitial();
  }

  Future<void> deleteStory(String storyId) async {
    await _deleteStory(storyId);
    await loadInitial();
  }
}
