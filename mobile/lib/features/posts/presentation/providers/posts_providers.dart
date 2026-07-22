import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/data_sources/posts_remote_data_source.dart';
import '../../data/repositories/posts_repository_impl.dart';
import '../../domain/repositories/posts_repository.dart';
import '../../domain/use_cases/get_feed_use_case.dart';
import '../../domain/use_cases/create_post_use_case.dart';
import '../../domain/use_cases/delete_post_use_case.dart';
import '../state/feed_notifier.dart';
import '../state/feed_state.dart';
import '../../../../core/api/dio_client.dart';

final postsRemoteDataSourceProvider = Provider((ref) {
  return PostsRemoteDataSource(DioClient.create());
});

final postsRepositoryProvider = Provider<PostsRepository>((ref) {
  return PostsRepositoryImpl(ref.read(postsRemoteDataSourceProvider));
});

final getFeedUseCaseProvider = Provider((ref) {
  return GetFeedUseCase(ref.read(postsRepositoryProvider));
});

final createPostUseCaseProvider = Provider((ref) {
  return CreatePostUseCase(ref.read(postsRepositoryProvider));
});

final deletePostUseCaseProvider = Provider((ref) {
  return DeletePostUseCase(ref.read(postsRepositoryProvider));
});

final feedProvider = StateNotifierProvider<FeedNotifier, FeedState>((ref) {
  return FeedNotifier(ref.read(getFeedUseCaseProvider), ref.read(deletePostUseCaseProvider));
});
