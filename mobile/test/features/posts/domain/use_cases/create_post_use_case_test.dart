import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:image_picker/image_picker.dart';
import 'package:tayyibt/features/posts/domain/entities/poll_option.dart';
import 'package:tayyibt/features/posts/domain/entities/post.dart';
import 'package:tayyibt/features/posts/domain/repositories/posts_repository.dart';
import 'package:tayyibt/features/posts/domain/use_cases/create_post_use_case.dart';

class MockPostsRepository extends Mock implements PostsRepository {}

void main() {
  setUpAll(() {
    registerFallbackValue(XFile(''));
  });

  late MockPostsRepository repository;
  late CreatePostUseCase useCase;

  setUp(() {
    repository = MockPostsRepository();
    useCase = CreatePostUseCase(repository);
  });

  Post post() => Post(
        id: 'p1',
        userId: 'u1',
        content: 'hello',
        createdAt: DateTime(2026, 1, 1),
        authorName: 'Amina',
      );

  test('forwards every composer field through to the repository unchanged', () async {
    const options = [PollOption(text: 'A'), PollOption(text: 'B')];
    when(() => repository.createPost(
          content: 'hello',
          image: null,
          bgColor: '#FF6B6B',
          feeling: 'سعيد',
          location: 'القاهرة',
          audience: 'public',
          pollOptions: options,
        )).thenAnswer((_) async => post());

    await useCase.call(
      content: 'hello',
      bgColor: '#FF6B6B',
      feeling: 'سعيد',
      location: 'القاهرة',
      audience: 'public',
      pollOptions: options,
    );

    verify(() => repository.createPost(
          content: 'hello',
          image: null,
          bgColor: '#FF6B6B',
          feeling: 'سعيد',
          location: 'القاهرة',
          audience: 'public',
          pollOptions: options,
        )).called(1);
  });

  test('a plain text post with no composer extras leaves them all null', () async {
    when(() => repository.createPost(
          content: 'hello',
          image: null,
          bgColor: null,
          feeling: null,
          location: null,
          audience: null,
          pollOptions: null,
        )).thenAnswer((_) async => post());

    await useCase.call(content: 'hello');

    verify(() => repository.createPost(
          content: 'hello',
          image: null,
          bgColor: null,
          feeling: null,
          location: null,
          audience: null,
          pollOptions: null,
        )).called(1);
  });
}
