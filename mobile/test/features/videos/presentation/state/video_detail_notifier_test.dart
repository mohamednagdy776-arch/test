import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/core/api/api_response.dart';
import 'package:tayyibt/features/saved/domain/repositories/saved_repository.dart';
import 'package:tayyibt/features/saved/domain/use_cases/check_saved_use_case.dart';
import 'package:tayyibt/features/saved/domain/use_cases/save_item_use_case.dart';
import 'package:tayyibt/features/videos/domain/entities/video.dart';
import 'package:tayyibt/features/videos/domain/entities/video_comment.dart';
import 'package:tayyibt/features/videos/domain/repositories/videos_repository.dart';
import 'package:tayyibt/features/videos/domain/use_cases/add_video_comment_use_case.dart';
import 'package:tayyibt/features/videos/domain/use_cases/delete_video_comment_use_case.dart';
import 'package:tayyibt/features/videos/domain/use_cases/get_recommended_videos_use_case.dart';
import 'package:tayyibt/features/videos/domain/use_cases/get_video_comments_use_case.dart';
import 'package:tayyibt/features/videos/domain/use_cases/get_video_reactions_use_case.dart';
import 'package:tayyibt/features/videos/domain/use_cases/get_video_use_case.dart';
import 'package:tayyibt/features/videos/domain/use_cases/react_to_video_use_case.dart';
import 'package:tayyibt/features/videos/domain/use_cases/toggle_video_like_use_case.dart';
import 'package:tayyibt/features/videos/domain/use_cases/update_video_comment_use_case.dart';
import 'package:tayyibt/features/videos/presentation/state/video_detail_notifier.dart';

class MockVideosRepository extends Mock implements VideosRepository {}

class MockSavedRepository extends Mock implements SavedRepository {}

Video _video({bool isLiked = false, int likeCount = 0, String id = 'v1'}) {
  return Video(
    id: id,
    title: 'a video',
    createdAt: DateTime(2026, 1, 1),
    authorId: 'u1',
    authorName: 'Amina',
    isLiked: isLiked,
    likeCount: likeCount,
  );
}

VideoComment _comment(String id) {
  return VideoComment(id: id, content: 'comment $id', createdAt: DateTime(2026, 1, 1), authorName: 'Sara');
}

PaginatedResult<Video> _page(List<Video> items) {
  return PaginatedResult<Video>(items: items, total: items.length, page: 1, limit: 20, totalPages: 1);
}

void main() {
  late MockVideosRepository repository;
  late MockSavedRepository savedRepository;
  late VideoDetailNotifier notifier;

  setUp(() {
    repository = MockVideosRepository();
    savedRepository = MockSavedRepository();
    notifier = VideoDetailNotifier(
      'v1',
      GetVideoUseCase(repository),
      ToggleVideoLikeUseCase(repository),
      ReactToVideoUseCase(repository),
      GetVideoReactionsUseCase(repository),
      GetVideoCommentsUseCase(repository),
      AddVideoCommentUseCase(repository),
      UpdateVideoCommentUseCase(repository),
      DeleteVideoCommentUseCase(repository),
      GetRecommendedVideosUseCase(repository),
      CheckSavedUseCase(savedRepository),
      SaveItemUseCase(savedRepository),
    );
    // Neutral defaults for the "best-effort extras" load() also fires, so
    // tests that don't care about save/recommended state don't need to stub
    // them individually.
    when(() => savedRepository.checkSaved('video', 'v1')).thenAnswer((_) async => false);
    when(() => repository.getRecommended(page: any(named: 'page'), limit: any(named: 'limit')))
        .thenAnswer((_) async => _page(const []));
  });

  test('load populates video, comments, and reactions', () async {
    when(() => repository.getVideo('v1')).thenAnswer((_) async => _video());
    when(() => repository.getComments('v1')).thenAnswer((_) async => [_comment('c1')]);
    when(() => repository.getReactions('v1'))
        .thenAnswer((_) async => const VideoReactions(counts: {'like': 1}, total: 1, userReaction: 'like'));

    await notifier.load();

    expect(notifier.state.video?.id, 'v1');
    expect(notifier.state.comments.single.id, 'c1');
    expect(notifier.state.reactions.total, 1);
    expect(notifier.state.isLoading, isFalse);
  });

  test('load sets an error when the repository throws', () async {
    when(() => repository.getVideo('v1')).thenThrow(Exception('not found'));

    await notifier.load();

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.video, isNull);
  });

  test('load also populates isSaved and the recommended list, excluding this video', () async {
    when(() => repository.getVideo('v1')).thenAnswer((_) async => _video());
    when(() => repository.getComments('v1')).thenAnswer((_) async => []);
    when(() => repository.getReactions('v1')).thenAnswer((_) async => const VideoReactions());
    when(() => savedRepository.checkSaved('video', 'v1')).thenAnswer((_) async => true);
    when(() => repository.getRecommended(page: any(named: 'page'), limit: any(named: 'limit')))
        .thenAnswer((_) async => _page([_video(id: 'v1'), _video(id: 'v2'), _video(id: 'v3')]));

    await notifier.load();

    expect(notifier.state.isSaved, isTrue);
    expect(notifier.state.recommended.map((v) => v.id), ['v2', 'v3']);
  });

  test('load tolerates isSaved/recommended failures without clearing the video', () async {
    when(() => repository.getVideo('v1')).thenAnswer((_) async => _video());
    when(() => repository.getComments('v1')).thenAnswer((_) async => []);
    when(() => repository.getReactions('v1')).thenAnswer((_) async => const VideoReactions());
    when(() => savedRepository.checkSaved('video', 'v1')).thenThrow(Exception('network error'));
    when(() => repository.getRecommended(page: any(named: 'page'), limit: any(named: 'limit')))
        .thenThrow(Exception('network error'));

    await notifier.load();

    expect(notifier.state.video?.id, 'v1');
    expect(notifier.state.isSaved, isFalse);
    expect(notifier.state.recommended, isEmpty);
  });

  test('toggleSave saves then marks isSaved, and is a no-op once already saved', () async {
    when(() => repository.getVideo('v1')).thenAnswer((_) async => _video());
    when(() => repository.getComments('v1')).thenAnswer((_) async => []);
    when(() => repository.getReactions('v1')).thenAnswer((_) async => const VideoReactions());
    await notifier.load();

    when(() => savedRepository.save('video', 'v1', collectionId: null)).thenAnswer((_) async {});

    await notifier.toggleSave();
    expect(notifier.state.isSaved, isTrue);
    expect(notifier.state.isSavePending, isFalse);

    await notifier.toggleSave();
    verify(() => savedRepository.save('video', 'v1', collectionId: null)).called(1);
  });

  test('toggleSave treats an "already saved" failure as success, matching web', () async {
    when(() => repository.getVideo('v1')).thenAnswer((_) async => _video());
    when(() => repository.getComments('v1')).thenAnswer((_) async => []);
    when(() => repository.getReactions('v1')).thenAnswer((_) async => const VideoReactions());
    await notifier.load();

    when(() => savedRepository.save('video', 'v1', collectionId: null)).thenThrow(Exception('Already saved'));

    await notifier.toggleSave();

    expect(notifier.state.isSaved, isTrue);
    expect(notifier.state.isSavePending, isFalse);
  });

  test('toggleLike optimistically flips then confirms with the repository', () async {
    when(() => repository.getVideo('v1')).thenAnswer((_) async => _video(isLiked: false, likeCount: 2));
    when(() => repository.getComments('v1')).thenAnswer((_) async => []);
    when(() => repository.getReactions('v1')).thenAnswer((_) async => const VideoReactions());
    await notifier.load();

    when(() => repository.toggleLike('v1', false)).thenAnswer((_) async => true);

    await notifier.toggleLike();

    expect(notifier.state.video?.isLiked, isTrue);
    expect(notifier.state.video?.likeCount, 3);
  });

  test('toggleLike reverts on failure', () async {
    when(() => repository.getVideo('v1')).thenAnswer((_) async => _video(isLiked: false, likeCount: 2));
    when(() => repository.getComments('v1')).thenAnswer((_) async => []);
    when(() => repository.getReactions('v1')).thenAnswer((_) async => const VideoReactions());
    await notifier.load();

    when(() => repository.toggleLike('v1', false)).thenThrow(Exception('network error'));

    await notifier.toggleLike();

    expect(notifier.state.video?.isLiked, isFalse);
    expect(notifier.state.video?.likeCount, 2);
  });

  test('addComment posts then reloads the comment list, ignoring a blank submission', () async {
    when(() => repository.addComment('v1', 'nice!')).thenAnswer((_) async => _comment('c1'));
    when(() => repository.getComments('v1')).thenAnswer((_) async => [_comment('c1')]);

    await notifier.addComment('   ');
    verifyNever(() => repository.addComment(any(), any()));

    await notifier.addComment('nice!');
    expect(notifier.state.comments.single.id, 'c1');
    expect(notifier.state.isSubmittingComment, isFalse);
  });

  test('editComment updates then reloads the comment list', () async {
    when(() => repository.updateComment('v1', 'c1', 'edited')).thenAnswer((_) async => _comment('c1'));
    when(() => repository.getComments('v1')).thenAnswer((_) async => [_comment('c1')]);

    await notifier.editComment('c1', 'edited');

    verify(() => repository.updateComment('v1', 'c1', 'edited')).called(1);
    expect(notifier.state.comments.single.id, 'c1');
  });

  test('deleteComment removes then reloads the comment list', () async {
    when(() => repository.deleteComment('v1', 'c1')).thenAnswer((_) async {});
    when(() => repository.getComments('v1')).thenAnswer((_) async => []);

    await notifier.deleteComment('c1');

    verify(() => repository.deleteComment('v1', 'c1')).called(1);
    expect(notifier.state.comments, isEmpty);
  });

  test('react sends the reaction then refreshes the summary', () async {
    when(() => repository.reactToVideo('v1', 'love')).thenAnswer((_) async => 'love');
    when(() => repository.getReactions('v1'))
        .thenAnswer((_) async => const VideoReactions(counts: {'love': 1}, total: 1, userReaction: 'love'));

    await notifier.react('love');

    expect(notifier.state.reactions.userReaction, 'love');
  });
}
