import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/posts/domain/entities/story.dart';
import 'package:tayyibt/features/posts/domain/repositories/stories_repository.dart';
import 'package:tayyibt/features/posts/domain/use_cases/create_story_use_case.dart';
import 'package:tayyibt/features/posts/domain/use_cases/delete_story_use_case.dart';
import 'package:tayyibt/features/posts/domain/use_cases/get_stories_use_case.dart';
import 'package:tayyibt/features/posts/presentation/state/stories_notifier.dart';

class MockStoriesRepository extends Mock implements StoriesRepository {}

StoryGroup _group(String userId, {List<Story>? stories}) {
  return StoryGroup(
    userId: userId,
    authorName: 'Amina',
    stories: stories ?? [Story(id: '${userId}_s1', userId: userId, createdAt: DateTime(2026, 1, 1), authorName: 'Amina')],
  );
}

void main() {
  late MockStoriesRepository repository;
  late StoriesNotifier notifier;

  setUp(() {
    repository = MockStoriesRepository();
    notifier = StoriesNotifier(
      GetStoriesUseCase(repository),
      CreateStoryUseCase(repository),
      DeleteStoryUseCase(repository),
    );
  });

  test('loadInitial populates groups on success', () async {
    when(() => repository.getStories()).thenAnswer((_) async => [_group('u1')]);

    await notifier.loadInitial();

    expect(notifier.state.groups.single.userId, 'u1');
    expect(notifier.state.isLoading, isFalse);
    expect(notifier.state.error, isNull);
  });

  test('loadInitial sets an error when the repository throws', () async {
    when(() => repository.getStories()).thenThrow(Exception('network error'));

    await notifier.loadInitial();

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.groups, isEmpty);
  });

  test('createStory creates then reloads the groups', () async {
    when(() => repository.createStory(
          mediaUrl: any(named: 'mediaUrl'),
          mediaType: any(named: 'mediaType'),
          thumbnailUrl: any(named: 'thumbnailUrl'),
          text: 'hello',
          bgColor: '#0A3D2B',
          duration: any(named: 'duration'),
        )).thenAnswer((_) async => Story(id: 's1', userId: 'me', createdAt: DateTime(2026, 1, 1), authorName: 'Me'));
    when(() => repository.getStories()).thenAnswer((_) async => [_group('me')]);

    await notifier.createStory(text: 'hello', bgColor: '#0A3D2B');

    expect(notifier.state.groups.single.userId, 'me');
  });

  test('deleteStory deletes then reloads the groups', () async {
    when(() => repository.deleteStory('s1')).thenAnswer((_) async {});
    when(() => repository.getStories()).thenAnswer((_) async => []);

    await notifier.deleteStory('s1');

    verify(() => repository.deleteStory('s1')).called(1);
    expect(notifier.state.groups, isEmpty);
  });
}
