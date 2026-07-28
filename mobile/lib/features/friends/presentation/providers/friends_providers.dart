import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/data_sources/friends_remote_data_source.dart';
import '../../data/repositories/friends_repository_impl.dart';
import '../../domain/repositories/friends_repository.dart';
import '../../domain/use_cases/get_friends_use_case.dart';
import '../../domain/use_cases/get_friend_requests_use_case.dart';
import '../../domain/use_cases/respond_to_friend_request_use_case.dart';
import '../../domain/use_cases/friend_relations_use_case.dart';
import '../state/friends_notifier.dart';
import '../state/friends_state.dart';
import '../../../../core/api/dio_client.dart';

final friendsRemoteDataSourceProvider = Provider((ref) {
  return FriendsRemoteDataSource(DioClient.create());
});

final friendsRepositoryProvider = Provider<FriendsRepository>((ref) {
  return FriendsRepositoryImpl(ref.read(friendsRemoteDataSourceProvider));
});

final getFriendsUseCaseProvider = Provider((ref) {
  return GetFriendsUseCase(ref.read(friendsRepositoryProvider));
});

final getFriendRequestsUseCaseProvider = Provider((ref) {
  return GetFriendRequestsUseCase(ref.read(friendsRepositoryProvider));
});

final respondToFriendRequestUseCaseProvider = Provider((ref) {
  return RespondToFriendRequestUseCase(ref.read(friendsRepositoryProvider));
});

final friendRelationsUseCaseProvider = Provider((ref) {
  return FriendRelationsUseCase(ref.read(friendsRepositoryProvider));
});

final friendsProvider = StateNotifierProvider<FriendsNotifier, FriendsState>((ref) {
  return FriendsNotifier(
    ref.read(getFriendsUseCaseProvider),
    ref.read(getFriendRequestsUseCaseProvider),
    ref.read(respondToFriendRequestUseCaseProvider),
    ref.read(friendRelationsUseCaseProvider),
  );
});
