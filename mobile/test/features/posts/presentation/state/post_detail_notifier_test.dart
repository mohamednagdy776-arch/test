import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/posts/domain/entities/comment.dart';
import 'package:tayyibt/features/posts/domain/entities/post.dart';
import 'package:tayyibt/features/posts/domain/entities/reaction_summary.dart';
import 'package:tayyibt/features/posts/domain/repositories/comments_repository.dart';
import 'package:tayyibt/features/posts/domain/repositories/posts_repository.dart';
import 'package:tayyibt/features/posts/domain/repositories/reactions_repository.dart';
import 'package:tayyibt/features/posts/domain/use_cases/add_comment_use_case.dart';
import 'package:tayyibt/features/posts/domain/use_cases/delete_comment_use_case.dart';
import 'package:tayyibt/features/posts/domain/use_cases/get_comments_use_case.dart';
import 'package:tayyibt/features/posts/domain/use_cases/get_post_reactions_use_case.dart';
import 'package:tayyibt/features/posts/domain/use_cases/get_post_use_case.dart';
import 'package:tayyibt/features/posts/domain/entities/poll_option.dart';
import 'package:tayyibt/features/posts/domain/use_cases/react_to_comment_use_case.dart';
import 'package:tayyibt/features/posts/domain/use_cases/toggle_post_reaction_use_case.dart';
import 'package:tayyibt/features/posts/domain/use_cases/update_comment_use_case.dart';
import 'package:tayyibt/features/posts/domain/use_cases/vote_poll_use_case.dart';
import 'package:tayyibt/features/posts/presentation/state/post_detail_notifier.dart';

class MockPostsRepository extends Mock implements PostsRepository {}

class MockCommentsRepository extends Mock implements CommentsRepository {}

class MockReactionsRepository extends Mock implements ReactionsRepository {}

Post _post({String id = 'p1'}) =>
    Post(id: id, userId: 'u1', content: 'hello world', createdAt: DateTime(2026, 1, 1), authorName: 'Amina');

Comment _comment(String id, {String? parentId, List<Comment> replies = const []}) {
  return Comment(
    id: id,
    content: 'comment $id',
    parentId: parentId,
    createdAt: DateTime(2026, 1, 1),
    authorId: 'u2',
    authorName: 'Sara',
    replies: replies,
  );
}

void main() {
  late MockPostsRepository postsRepository;
  late MockCommentsRepository commentsRepository;
  late MockReactionsRepository reactionsRepository;
  late PostDetailNotifier notifier;

  setUp(() {
    postsRepository = MockPostsRepository();
    commentsRepository = MockCommentsRepository();
    reactionsRepository = MockReactionsRepository();
    notifier = PostDetailNotifier(
      'p1',
      GetPostUseCase(postsRepository),
      GetCommentsUseCase(commentsRepository),
      AddCommentUseCase(commentsRepository),
      UpdateCommentUseCase(commentsRepository),
      DeleteCommentUseCase(commentsRepository),
      ReactToCommentUseCase(commentsRepository),
      GetPostReactionsUseCase(reactionsRepository),
      TogglePostReactionUseCase(reactionsRepository),
      VotePollUseCase(postsRepository),
    );
  });

  test('load populates post, comments, and reactions', () async {
    when(() => postsRepository.getPost('p1')).thenAnswer((_) async => _post());
    when(() => commentsRepository.getComments('p1')).thenAnswer((_) async => [_comment('c1')]);
    when(() => reactionsRepository.getReactions('p1')).thenAnswer(
      (_) async => const ReactionSummary(counts: {'like': 2}, total: 2, userReaction: 'like'),
    );

    await notifier.load();

    expect(notifier.state.post?.id, 'p1');
    expect(notifier.state.comments.single.id, 'c1');
    expect(notifier.state.reactions.total, 2);
    expect(notifier.state.reactions.userReaction, 'like');
    expect(notifier.state.isLoading, isFalse);
  });

  test('load sets an error when the repository throws', () async {
    when(() => postsRepository.getPost('p1')).thenThrow(Exception('not found'));

    await notifier.load();

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.post, isNull);
  });

  test('addComment posts the comment then reloads the thread, ignoring a blank submission', () async {
    when(() => commentsRepository.addComment('p1', content: 'nice post!', parentId: null))
        .thenAnswer((_) async => _comment('c1'));
    when(() => commentsRepository.getComments('p1')).thenAnswer((_) async => [_comment('c1')]);

    await notifier.addComment('   ');
    verifyNever(() => commentsRepository.addComment(any(), content: any(named: 'content')));

    await notifier.addComment('nice post!');
    expect(notifier.state.comments.single.id, 'c1');
    expect(notifier.state.isSubmittingComment, isFalse);
  });

  test('addComment forwards parentId for a reply', () async {
    when(() => commentsRepository.addComment('p1', content: 'a reply', parentId: 'c1'))
        .thenAnswer((_) async => _comment('c2', parentId: 'c1'));
    when(() => commentsRepository.getComments('p1'))
        .thenAnswer((_) async => [_comment('c1', replies: [_comment('c2', parentId: 'c1')])]);

    await notifier.addComment('a reply', parentId: 'c1');

    verify(() => commentsRepository.addComment('p1', content: 'a reply', parentId: 'c1')).called(1);
    expect(notifier.state.comments.single.replies.single.id, 'c2');
  });

  test('deleteComment removes the comment then reloads the thread', () async {
    when(() => commentsRepository.deleteComment('p1', 'c2')).thenAnswer((_) async {});
    when(() => commentsRepository.getComments('p1')).thenAnswer((_) async => [_comment('c1')]);

    await notifier.deleteComment('c2');

    verify(() => commentsRepository.deleteComment('p1', 'c2')).called(1);
    expect(notifier.state.comments.map((c) => c.id), ['c1']);
  });

  test('deleteComment sets an error when the repository throws', () async {
    when(() => commentsRepository.deleteComment('p1', 'c1')).thenThrow(Exception('forbidden'));

    await notifier.deleteComment('c1');

    expect(notifier.state.error, isNotNull);
  });

  test('reactToComment sends the reaction then reloads the thread', () async {
    when(() => commentsRepository.reactToComment('p1', 'c1', 'love')).thenAnswer((_) async => 'love');
    when(() => commentsRepository.getComments('p1')).thenAnswer(
      (_) async => [Comment(
        id: 'c1',
        content: 'comment c1',
        createdAt: DateTime(2026, 1, 1),
        authorId: 'u2',
        authorName: 'Sara',
        reactions: const [CommentReactionEntry(userId: 'me', type: 'love')],
      )],
    );

    await notifier.reactToComment('c1', 'love');

    expect(notifier.state.comments.single.reactionCounts['love'], 1);
  });

  test('toggleReaction reacts to the post then refreshes the summary', () async {
    when(() => reactionsRepository.reactToPost('p1', 'love')).thenAnswer((_) async => 'love');
    when(() => reactionsRepository.getReactions('p1')).thenAnswer(
      (_) async => const ReactionSummary(counts: {'love': 1}, total: 1, userReaction: 'love'),
    );

    await notifier.toggleReaction('love');

    expect(notifier.state.reactions.userReaction, 'love');
    expect(notifier.state.reactions.total, 1);
  });

  test('toggleReaction restores the previous summary and sets an error on failure', () async {
    when(() => reactionsRepository.reactToPost('p1', 'love')).thenThrow(Exception('network error'));

    await notifier.toggleReaction('love');

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.reactions.total, 0);
  });

  test('votePoll patches pollOptions and myVote from the vote response, not a reload', () async {
    when(() => postsRepository.getPost('p1')).thenAnswer(
      (_) async => Post(
        id: 'p1',
        userId: 'u1',
        content: 'poll post',
        createdAt: DateTime(2026, 1, 1),
        authorName: 'Amina',
        pollOptions: const [PollOption(text: 'A', votes: 0), PollOption(text: 'B', votes: 0)],
      ),
    );
    when(() => commentsRepository.getComments('p1')).thenAnswer((_) async => []);
    when(() => reactionsRepository.getReactions('p1')).thenAnswer((_) async => const ReactionSummary());
    when(() => postsRepository.votePoll('p1', 1)).thenAnswer(
      (_) async => const PollVoteResult(
        pollOptions: [PollOption(text: 'A', votes: 0), PollOption(text: 'B', votes: 1)],
        myVote: 1,
      ),
    );

    await notifier.load();
    await notifier.votePoll(1);

    expect(notifier.state.post?.myVote, 1);
    expect(notifier.state.post?.pollOptions?[1].votes, 1);
    // getPost is only ever called once (from load()) -- votePoll patches the
    // existing post from its own response instead of re-fetching it.
    verify(() => postsRepository.getPost('p1')).called(1);
  });

  test('votePoll is a no-op when no post has loaded yet', () async {
    await notifier.votePoll(0);

    verifyNever(() => postsRepository.votePoll(any(), any()));
    expect(notifier.state.post, isNull);
  });

  test('votePoll sets an error when the repository throws, keeping the previous post', () async {
    final original = Post(
      id: 'p1',
      userId: 'u1',
      content: 'poll post',
      createdAt: DateTime(2026, 1, 1),
      authorName: 'Amina',
      pollOptions: const [PollOption(text: 'A', votes: 0), PollOption(text: 'B', votes: 0)],
    );
    when(() => postsRepository.getPost('p1')).thenAnswer((_) async => original);
    when(() => commentsRepository.getComments('p1')).thenAnswer((_) async => []);
    when(() => reactionsRepository.getReactions('p1')).thenAnswer((_) async => const ReactionSummary());
    when(() => postsRepository.votePoll('p1', 0)).thenThrow(Exception('network error'));

    await notifier.load();
    await notifier.votePoll(0);

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.post?.pollOptions?[0].votes, 0);
  });

  test('setPost replaces the in-memory post directly (used after a successful edit)', () async {
    when(() => postsRepository.getPost('p1')).thenAnswer((_) async => _post());
    when(() => commentsRepository.getComments('p1')).thenAnswer((_) async => []);
    when(() => reactionsRepository.getReactions('p1')).thenAnswer((_) async => const ReactionSummary());

    await notifier.load();
    notifier.setPost(_post().copyWith());
    final edited = Post(
      id: 'p1',
      userId: 'u1',
      content: 'edited content',
      createdAt: DateTime(2026, 1, 1),
      authorName: 'Amina',
    );

    notifier.setPost(edited);

    expect(notifier.state.post?.content, 'edited content');
  });
}
