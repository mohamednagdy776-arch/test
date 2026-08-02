import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/use_cases/get_public_profile_use_case.dart';
import '../../domain/use_cases/get_profile_content_use_case.dart';
import '../../domain/use_cases/get_follow_summary_use_case.dart';
import '../../domain/use_cases/report_user_use_case.dart';
import '../../../friends/domain/use_cases/friend_relations_use_case.dart';
import '../../../friends/domain/use_cases/respond_to_friend_request_use_case.dart';
import '../../../interests/domain/use_cases/send_interest_use_case.dart';
import '../../../interests/domain/use_cases/get_sent_interests_use_case.dart';
import 'public_profile_state.dart';

// Mirrors web's ProfileView.tsx: friendshipStatus comes embedded in the
// profile response itself (not a separate query -- avoids the stale-cache
// desync bug #429/#120 that motivated that embedding on web), and each tab's
// content is only fetched once selected.
class PublicProfileNotifier extends StateNotifier<PublicProfileState> {
  final String userId;
  final GetPublicProfileUseCase _getProfile;
  final GetProfileContentUseCase _content;
  final GetFollowSummaryUseCase _followSummary;
  final ReportUserUseCase _report;
  final FriendRelationsUseCase _friendRelations;
  final RespondToFriendRequestUseCase _friendRequests;
  final SendInterestUseCase _sendInterest;
  final GetSentInterestsUseCase _getSentInterests;

  PublicProfileNotifier(
    this.userId,
    this._getProfile,
    this._content,
    this._followSummary,
    this._report,
    this._friendRelations,
    this._friendRequests,
    this._sendInterest,
    this._getSentInterests,
  ) : super(const PublicProfileState());

  Future<void> load() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final profile = await _getProfile(userId);
      state = state.copyWith(profile: profile, isLoading: false, error: null);
      // Fire-and-forget, best-effort supplementary reads -- a failure here
      // shouldn't block the header from rendering.
      if (!profile.isSelf) {
        _loadFollowSummary();
        _loadAlreadySentInterest();
      }
      await loadTab(state.activeTab);
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل الملف الشخصي');
    }
  }

  Future<void> refresh() => load();

  Future<void> _loadFollowSummary() async {
    try {
      final status = await _followSummary.status(userId);
      final counts = await _followSummary.counts(userId);
      state = state.copyWith(followStatus: status, followCounts: counts, error: state.error);
    } catch (_) {
      // Non-fatal -- header just omits the follow pill/counts.
    }
  }

  Future<void> _loadAlreadySentInterest() async {
    try {
      final sent = await _getSentInterests();
      final already = sent.any((r) => r.user.id == userId);
      state = state.copyWith(alreadySentInterest: already, error: state.error);
    } catch (_) {
      // Non-fatal.
    }
  }

  void setTab(PublicProfileTab tab) {
    state = state.copyWith(activeTab: tab, error: state.error);
    loadTab(tab);
  }

  Future<void> loadTab(PublicProfileTab tab) async {
    switch (tab) {
      case PublicProfileTab.posts:
        if (state.posts.isNotEmpty || state.postsLoading) return;
        state = state.copyWith(postsLoading: true, error: state.error);
        try {
          final page = await _content.posts(userId);
          state = state.copyWith(posts: page.items, postsLoading: false, error: state.error);
        } catch (_) {
          state = state.copyWith(postsLoading: false, error: state.error);
        }
        break;
      case PublicProfileTab.friends:
        if (state.friends.isNotEmpty || state.friendsLoading) return;
        state = state.copyWith(friendsLoading: true, error: state.error);
        try {
          final friends = await _content.friends(userId);
          state = state.copyWith(friends: friends, friendsLoading: false, error: state.error);
        } catch (_) {
          state = state.copyWith(friendsLoading: false, error: state.error);
        }
        break;
      case PublicProfileTab.photos:
        if (state.photos.isNotEmpty || state.photosLoading) return;
        state = state.copyWith(photosLoading: true, error: state.error);
        try {
          final photos = await _content.photos(userId);
          state = state.copyWith(photos: photos, photosLoading: false, error: state.error);
        } catch (_) {
          state = state.copyWith(photosLoading: false, error: state.error);
        }
        break;
      case PublicProfileTab.videos:
        if (state.videos.isNotEmpty || state.videosLoading) return;
        state = state.copyWith(videosLoading: true, error: state.error);
        try {
          final videos = await _content.videos(userId);
          state = state.copyWith(videos: videos, videosLoading: false, error: state.error);
        } catch (_) {
          state = state.copyWith(videosLoading: false, error: state.error);
        }
        break;
      case PublicProfileTab.about:
        break; // Rendered straight from the already-loaded profile.
      case PublicProfileTab.activity:
        await _loadActivity();
        break;
    }
  }

  // Never fetched for another user's profile -- the backend 403s any id
  // other than the caller's own (curl-verified live), same reasoning as
  // web's renderTab() skipping ActivityLogViewer entirely when !isSelf.
  Future<void> _loadActivity({bool force = false}) async {
    if (state.profile?.isSelf != true) return;
    if (!force && (state.activityLog != null || state.activityLoading)) return;
    state = state.copyWith(activityLoading: true, error: state.error);
    try {
      final result = await _content.activity(userId, year: state.activityYear, type: state.activityType);
      state = state.copyWith(activityLog: result, activityLoading: false, error: state.error);
    } catch (_) {
      state = state.copyWith(activityLoading: false, error: state.error);
    }
  }

  // Called from the tab's year/type dropdowns -- always force-refetches
  // (unlike loadTab's lazy once-only loads for posts/friends/photos/videos)
  // since a filter change must overwrite the previously cached result.
  Future<void> setActivityFilters({String? year, String? type}) {
    state = state.copyWith(
      activityYear: year ?? state.activityYear,
      activityType: type ?? state.activityType,
      error: state.error,
    );
    return _loadActivity(force: true);
  }

  Future<void> sendFriendRequest() => _friendAction(() => _friendRequests.send(userId));

  Future<void> cancelFriendRequest() async {
    final id = state.profile?.friendshipStatus?.requestId;
    if (id == null) return;
    await _friendAction(() => _friendRequests.cancel(id));
  }

  Future<void> acceptFriendRequest() async {
    final id = state.profile?.friendshipStatus?.requestId;
    if (id == null) return;
    await _friendAction(() => _friendRequests.accept(id));
  }

  Future<void> unfriend() => _friendAction(() => _friendRelations.unfriend(userId));

  Future<void> _friendAction(Future<void> Function() action) async {
    state = state.copyWith(friendActionPending: true, error: state.error);
    try {
      await action();
      // Re-fetch the profile so the embedded friendshipStatus reflects the
      // new state, same as web invalidating ['user-profile', userId].
      final profile = await _getProfile(userId);
      state = state.copyWith(profile: profile, friendActionPending: false, error: null);
    } catch (_) {
      state = state.copyWith(friendActionPending: false, error: 'تعذّر تنفيذ الإجراء');
    }
  }

  Future<void> toggleFollow() async {
    final currentlyFollowing = state.followStatus?.following ?? false;
    state = state.copyWith(followActionPending: true, error: state.error);
    try {
      if (currentlyFollowing) {
        await _friendRelations.unfollow(userId);
      } else {
        await _friendRelations.follow(userId);
      }
      final status = await _followSummary.status(userId);
      final counts = await _followSummary.counts(userId);
      state = state.copyWith(
        followStatus: status,
        followCounts: counts,
        followActionPending: false,
        error: null,
      );
    } catch (_) {
      state = state.copyWith(followActionPending: false, error: 'تعذّر تنفيذ الإجراء');
    }
  }

  Future<bool> sendSalam() async {
    if (state.alreadySentInterest || state.sendInterestPending) return false;
    state = state.copyWith(sendInterestPending: true, error: state.error);
    try {
      final result = await _sendInterest(userId);
      state = state.copyWith(sendInterestPending: false, alreadySentInterest: true, error: null);
      return result['mutual'] == true;
    } catch (_) {
      state = state.copyWith(sendInterestPending: false, error: 'تعذّر إرسال الاهتمام');
      rethrow;
    }
  }

  Future<void> submitReport(String reason, String? details) async {
    state = state.copyWith(reportPending: true, error: state.error);
    try {
      await _report(userId, reason, details);
      state = state.copyWith(reportPending: false, error: null);
    } catch (_) {
      state = state.copyWith(reportPending: false, error: 'تعذّر إرسال البلاغ');
      rethrow;
    }
  }
}
