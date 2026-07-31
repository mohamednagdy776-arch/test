import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/core/api/api_response.dart';
import 'package:tayyibt/features/friends/domain/entities/friend_user.dart';
import 'package:tayyibt/features/friends/domain/entities/friendship_status.dart';
import 'package:tayyibt/features/friends/domain/repositories/friends_repository.dart';
import 'package:tayyibt/features/friends/domain/use_cases/friend_relations_use_case.dart';
import 'package:tayyibt/features/friends/domain/use_cases/respond_to_friend_request_use_case.dart';
import 'package:tayyibt/features/interests/domain/entities/interest_row.dart';
import 'package:tayyibt/features/interests/domain/entities/person_summary.dart';
import 'package:tayyibt/features/interests/domain/repositories/interests_repository.dart';
import 'package:tayyibt/features/interests/domain/use_cases/get_sent_interests_use_case.dart';
import 'package:tayyibt/features/interests/domain/use_cases/send_interest_use_case.dart';
import 'package:tayyibt/features/posts/domain/entities/post.dart';
import 'package:tayyibt/features/profile/domain/entities/follow_summary.dart';
import 'package:tayyibt/features/profile/domain/entities/public_profile.dart';
import 'package:tayyibt/features/profile/domain/repositories/profile_repository.dart';
import 'package:tayyibt/features/profile/domain/use_cases/get_follow_summary_use_case.dart';
import 'package:tayyibt/features/profile/domain/use_cases/get_profile_content_use_case.dart';
import 'package:tayyibt/features/profile/domain/use_cases/get_public_profile_use_case.dart';
import 'package:tayyibt/features/profile/domain/use_cases/report_user_use_case.dart';
import 'package:tayyibt/features/profile/presentation/state/public_profile_notifier.dart';
import 'package:tayyibt/features/profile/presentation/state/public_profile_state.dart';

class MockProfileRepository extends Mock implements ProfileRepository {}

class MockFriendsRepository extends Mock implements FriendsRepository {}

class MockInterestsRepository extends Mock implements InterestsRepository {}

const _otherUserId = 'u2';

PublicProfile _profile({FriendshipStatus? friendshipStatus, bool isSelf = false}) {
  return PublicProfile(
    id: 'p1',
    userId: _otherUserId,
    fullName: 'Layla',
    isSelf: isSelf,
    friendshipStatus: friendshipStatus,
  );
}

void main() {
  late MockProfileRepository profileRepository;
  late MockFriendsRepository friendsRepository;
  late MockInterestsRepository interestsRepository;
  late PublicProfileNotifier notifier;

  setUp(() {
    profileRepository = MockProfileRepository();
    friendsRepository = MockFriendsRepository();
    interestsRepository = MockInterestsRepository();

    // Default happy-path stubs for the fire-and-forget supplementary reads
    // load() triggers (follow summary + already-sent-interest check) so
    // tests that don't care about them don't need to stub every call.
    when(() => profileRepository.getFollowStatus(_otherUserId))
        .thenAnswer((_) async => const FollowStatus(following: false));
    when(() => profileRepository.getFollowCounts(_otherUserId))
        .thenAnswer((_) async => const FollowCounts(followers: 0, following: 0));
    when(() => interestsRepository.getSent()).thenAnswer((_) async => []);

    notifier = PublicProfileNotifier(
      _otherUserId,
      GetPublicProfileUseCase(profileRepository),
      GetProfileContentUseCase(profileRepository),
      GetFollowSummaryUseCase(profileRepository),
      ReportUserUseCase(profileRepository),
      FriendRelationsUseCase(friendsRepository),
      RespondToFriendRequestUseCase(friendsRepository),
      SendInterestUseCase(interestsRepository),
      GetSentInterestsUseCase(interestsRepository),
    );
  });

  test('load populates the profile and defaults to the posts tab', () async {
    when(() => profileRepository.getPublicProfile(_otherUserId)).thenAnswer((_) async => _profile());
    when(() => profileRepository.getUserPosts(_otherUserId, page: 1, limit: 10)).thenAnswer(
      (_) async => const PaginatedResult<Post>(items: [], total: 0, page: 1, limit: 10, totalPages: 0),
    );

    await notifier.load();

    expect(notifier.state.profile?.fullName, 'Layla');
    expect(notifier.state.activeTab, PublicProfileTab.posts);
    expect(notifier.state.isLoading, isFalse);
    expect(notifier.state.error, isNull);
  });

  test('load sets an error when the repository throws', () async {
    when(() => profileRepository.getPublicProfile(_otherUserId)).thenThrow(Exception('network error'));

    await notifier.load();

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.profile, isNull);
    expect(notifier.state.isLoading, isFalse);
  });

  test('load flags alreadySentInterest when a matching sent interest exists', () async {
    when(() => profileRepository.getPublicProfile(_otherUserId)).thenAnswer((_) async => _profile());
    when(() => profileRepository.getUserPosts(_otherUserId, page: 1, limit: 10)).thenAnswer(
      (_) async => const PaginatedResult<Post>(items: [], total: 0, page: 1, limit: 10, totalPages: 0),
    );
    when(() => interestsRepository.getSent()).thenAnswer(
      (_) async => [InterestRow(id: 'i1', status: 'pending', createdAt: DateTime(2026, 1, 1), user: const PersonSummary(id: _otherUserId))],
    );

    await notifier.load();

    expect(notifier.state.alreadySentInterest, isTrue);
  });

  test('setTab(friends) lazily loads the friends tab exactly once', () async {
    when(() => profileRepository.getPublicProfile(_otherUserId)).thenAnswer((_) async => _profile());
    when(() => profileRepository.getUserPosts(_otherUserId, page: 1, limit: 10)).thenAnswer(
      (_) async => const PaginatedResult<Post>(items: [], total: 0, page: 1, limit: 10, totalPages: 0),
    );
    when(() => profileRepository.getUserFriends(_otherUserId, page: 1, limit: 20))
        .thenAnswer((_) async => [const FriendUser(id: 'f1', fullName: 'Sara')]);

    await notifier.load();
    notifier.setTab(PublicProfileTab.friends);
    await Future.microtask(() {});
    // Give the async loadTab call a beat to complete.
    await Future<void>.delayed(Duration.zero);

    expect(notifier.state.activeTab, PublicProfileTab.friends);
    expect(notifier.state.friends.single.id, 'f1');
    verify(() => profileRepository.getUserFriends(_otherUserId, page: 1, limit: 20)).called(1);
  });

  test('sendFriendRequest re-fetches the profile so friendshipStatus updates', () async {
    when(() => profileRepository.getPublicProfile(_otherUserId)).thenAnswer(
      (_) async => _profile(friendshipStatus: const FriendshipStatus(status: 'none')),
    );
    when(() => profileRepository.getUserPosts(_otherUserId, page: 1, limit: 10)).thenAnswer(
      (_) async => const PaginatedResult<Post>(items: [], total: 0, page: 1, limit: 10, totalPages: 0),
    );
    await notifier.load();

    when(() => friendsRepository.sendRequest(_otherUserId)).thenAnswer((_) async {});
    when(() => profileRepository.getPublicProfile(_otherUserId)).thenAnswer(
      (_) async => _profile(friendshipStatus: const FriendshipStatus(status: 'pending', requestId: 'r1', isRequester: true)),
    );

    await notifier.sendFriendRequest();

    expect(notifier.state.profile?.friendshipStatus?.status, 'pending');
    expect(notifier.state.friendActionPending, isFalse);
    verify(() => friendsRepository.sendRequest(_otherUserId)).called(1);
  });

  test('sendFriendRequest sets an error and clears pending on failure', () async {
    when(() => profileRepository.getPublicProfile(_otherUserId)).thenAnswer((_) async => _profile());
    when(() => profileRepository.getUserPosts(_otherUserId, page: 1, limit: 10)).thenAnswer(
      (_) async => const PaginatedResult<Post>(items: [], total: 0, page: 1, limit: 10, totalPages: 0),
    );
    await notifier.load();

    when(() => friendsRepository.sendRequest(_otherUserId)).thenThrow(Exception('boom'));

    await notifier.sendFriendRequest();

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.friendActionPending, isFalse);
  });

  test('toggleFollow follows when not currently following, then refreshes counts', () async {
    when(() => profileRepository.getPublicProfile(_otherUserId)).thenAnswer((_) async => _profile());
    when(() => profileRepository.getUserPosts(_otherUserId, page: 1, limit: 10)).thenAnswer(
      (_) async => const PaginatedResult<Post>(items: [], total: 0, page: 1, limit: 10, totalPages: 0),
    );
    await notifier.load();

    when(() => friendsRepository.follow(_otherUserId)).thenAnswer((_) async {});
    when(() => profileRepository.getFollowStatus(_otherUserId))
        .thenAnswer((_) async => const FollowStatus(following: true));
    when(() => profileRepository.getFollowCounts(_otherUserId))
        .thenAnswer((_) async => const FollowCounts(followers: 1, following: 0));

    await notifier.toggleFollow();

    expect(notifier.state.followStatus?.following, isTrue);
    expect(notifier.state.followCounts?.followers, 1);
    verify(() => friendsRepository.follow(_otherUserId)).called(1);
    verifyNever(() => friendsRepository.unfollow(_otherUserId));
  });

  test('sendSalam marks alreadySentInterest and reports mutual status', () async {
    when(() => profileRepository.getPublicProfile(_otherUserId)).thenAnswer((_) async => _profile());
    when(() => profileRepository.getUserPosts(_otherUserId, page: 1, limit: 10)).thenAnswer(
      (_) async => const PaginatedResult<Post>(items: [], total: 0, page: 1, limit: 10, totalPages: 0),
    );
    await notifier.load();

    when(() => interestsRepository.sendInterest(_otherUserId)).thenAnswer((_) async => {'status': 'mutual', 'mutual': true});

    final mutual = await notifier.sendSalam();

    expect(mutual, isTrue);
    expect(notifier.state.alreadySentInterest, isTrue);
    expect(notifier.state.sendInterestPending, isFalse);
  });

  test('submitReport delegates to the repository and clears pending', () async {
    when(() => profileRepository.getPublicProfile(_otherUserId)).thenAnswer((_) async => _profile());
    when(() => profileRepository.getUserPosts(_otherUserId, page: 1, limit: 10)).thenAnswer(
      (_) async => const PaginatedResult<Post>(items: [], total: 0, page: 1, limit: 10, totalPages: 0),
    );
    await notifier.load();

    when(() => profileRepository.reportUser(_otherUserId, 'harassment', 'details')).thenAnswer((_) async {});

    await notifier.submitReport('harassment', 'details');

    expect(notifier.state.reportPending, isFalse);
    expect(notifier.state.error, isNull);
    verify(() => profileRepository.reportUser(_otherUserId, 'harassment', 'details')).called(1);
  });
}
