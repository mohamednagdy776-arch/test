import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/data_sources/pages_remote_data_source.dart';
import '../../data/repositories/pages_repository_impl.dart';
import '../../domain/repositories/pages_repository.dart';
import '../../domain/use_cases/get_pages_use_case.dart';
import '../../domain/use_cases/page_detail_use_case.dart';
import '../../domain/use_cases/manage_page_use_case.dart';
import '../../domain/use_cases/page_posts_use_case.dart';
import '../state/pages_list_notifier.dart';
import '../state/pages_list_state.dart';
import '../state/page_detail_notifier.dart';
import '../state/page_detail_state.dart';
import '../../../../core/api/dio_client.dart';

final pagesRemoteDataSourceProvider = Provider((ref) {
  return PagesRemoteDataSource(DioClient.create());
});

final pagesRepositoryProvider = Provider<PagesRepository>((ref) {
  return PagesRepositoryImpl(ref.read(pagesRemoteDataSourceProvider));
});

final getPagesUseCaseProvider = Provider((ref) {
  return GetPagesUseCase(ref.read(pagesRepositoryProvider));
});

final pageDetailUseCaseProvider = Provider((ref) {
  return PageDetailUseCase(ref.read(pagesRepositoryProvider));
});

final managePageUseCaseProvider = Provider((ref) {
  return ManagePageUseCase(ref.read(pagesRepositoryProvider));
});

final pagePostsUseCaseProvider = Provider((ref) {
  return PagePostsUseCase(ref.read(pagesRepositoryProvider));
});

final pagesListProvider = StateNotifierProvider<PagesListNotifier, PagesListState>((ref) {
  return PagesListNotifier(ref.read(getPagesUseCaseProvider), ref.read(managePageUseCaseProvider));
});

final pageDetailProvider =
    StateNotifierProvider.family<PageDetailNotifier, PageDetailState, String>((ref, pageId) {
  return PageDetailNotifier(
    pageId,
    ref.read(pageDetailUseCaseProvider),
    ref.read(managePageUseCaseProvider),
    ref.read(pagePostsUseCaseProvider),
  );
});
