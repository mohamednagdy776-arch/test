import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/data_sources/chat_remote_data_source.dart';
import '../../data/data_sources/chat_translation_client.dart';
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

// Phase 22: per-message translate toggle -- hits Google's free public
// endpoint directly (see ChatTranslationClient's doc comment), not our
// backend, so it gets its own tiny provider instead of chatRepositoryProvider.
final chatTranslationClientProvider = Provider((ref) {
  return ChatTranslationClient();
});

final conversationsProvider = FutureProvider<List<Conversation>>((ref) {
  return ref.read(getConversationsUseCaseProvider).call();
});

// Keyed by conversationId AND the other participant's user id -- the latter
// is needed for presence ('getPresence'/'presence') and read-receipt
// ('messageSeen') socket events, which are scoped per-user, not just per
// conversation (mirrors web/ChatWindow.tsx's `match.user2Id` usage). A record
// is a perfectly valid, hashable Riverpod family argument.
typedef ChatThreadKey = ({String conversationId, String? otherUserId});

final chatThreadProvider = StateNotifierProvider.family<ChatThreadNotifier, ChatThreadState, ChatThreadKey>(
  (ref, key) {
    final myUserId = ref.read(myProfileProvider).value?.userId ?? '';
    return ChatThreadNotifier(
      ref.read(chatThreadUseCaseProvider),
      conversationId: key.conversationId,
      myUserId: myUserId,
      otherUserId: key.otherUserId,
    );
  },
);
