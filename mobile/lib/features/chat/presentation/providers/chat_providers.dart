import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/data_sources/chat_remote_data_source.dart';
import '../../data/repositories/chat_repository_impl.dart';
import '../../domain/entities/conversation.dart';
import '../../domain/repositories/chat_repository.dart';
import '../../domain/use_cases/get_conversations_use_case.dart';
import '../../domain/use_cases/get_or_create_conversation_use_case.dart';
import '../../domain/use_cases/chat_thread_use_case.dart';
import '../state/chat_thread_notifier.dart';
import '../state/chat_thread_state.dart';
import '../../../../core/api/dio_client.dart';
import '../../../../features/profile/presentation/providers/profile_providers.dart';

final chatRemoteDataSourceProvider = Provider((ref) {
  return ChatRemoteDataSource(DioClient.create());
});

final chatRepositoryProvider = Provider<ChatRepository>((ref) {
  return ChatRepositoryImpl(ref.read(chatRemoteDataSourceProvider));
});

final getConversationsUseCaseProvider = Provider((ref) {
  return GetConversationsUseCase(ref.read(chatRepositoryProvider));
});

final getOrCreateConversationUseCaseProvider = Provider((ref) {
  return GetOrCreateConversationUseCase(ref.read(chatRepositoryProvider));
});

final chatThreadUseCaseProvider = Provider((ref) {
  return ChatThreadUseCase(ref.read(chatRepositoryProvider));
});

final conversationsProvider = FutureProvider<List<Conversation>>((ref) {
  return ref.read(getConversationsUseCaseProvider).call();
});

final chatThreadProvider = StateNotifierProvider.family<ChatThreadNotifier, ChatThreadState, String>(
  (ref, conversationId) {
    final myUserId = ref.read(myProfileProvider).value?.userId ?? '';
    return ChatThreadNotifier(
      ref.read(chatThreadUseCaseProvider),
      conversationId: conversationId,
      myUserId: myUserId,
    );
  },
);
