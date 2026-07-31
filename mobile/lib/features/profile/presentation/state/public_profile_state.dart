import '../../domain/entities/public_profile.dart';
import '../../domain/entities/follow_summary.dart';
import '../../../friends/domain/entities/friend_user.dart';
import '../../../posts/domain/entities/post.dart';
import '../../domain/entities/profile_media_item.dart';

enum PublicProfileTab { posts, about, friends, photos, videos }

class PublicProfileState {
  final PublicProfile? profile;
  final bool isLoading;
  final String? error;
  final PublicProfileTab activeTab;

  final List<Post> posts;
  final bool postsLoading;
  final List<FriendUser> friends;
  final bool friendsLoading;
  final List<ProfilePhotoItem> photos;
  final bool photosLoading;
  final List<ProfileVideoItem> videos;
  final bool videosLoading;

  final FollowStatus? followStatus;
  final FollowCounts? followCounts;

  // Mirrors web ProfileHeader's per-action pending flags so the button that
  // was tapped shows a spinner without freezing the rest of the header.
  final bool friendActionPending;
  final bool followActionPending;
  final bool sendInterestPending;
  final bool alreadySentInterest;
  final bool reportPending;

  const PublicProfileState({
    this.profile,
    this.isLoading = false,
    this.error,
    this.activeTab = PublicProfileTab.posts,
    this.posts = const [],
    this.postsLoading = false,
    this.friends = const [],
    this.friendsLoading = false,
    this.photos = const [],
    this.photosLoading = false,
    this.videos = const [],
    this.videosLoading = false,
    this.followStatus,
    this.followCounts,
    this.friendActionPending = false,
    this.followActionPending = false,
    this.sendInterestPending = false,
    this.alreadySentInterest = false,
    this.reportPending = false,
  });

  PublicProfileState copyWith({
    PublicProfile? profile,
    bool? isLoading,
    String? error,
    PublicProfileTab? activeTab,
    List<Post>? posts,
    bool? postsLoading,
    List<FriendUser>? friends,
    bool? friendsLoading,
    List<ProfilePhotoItem>? photos,
    bool? photosLoading,
    List<ProfileVideoItem>? videos,
    bool? videosLoading,
    FollowStatus? followStatus,
    FollowCounts? followCounts,
    bool? friendActionPending,
    bool? followActionPending,
    bool? sendInterestPending,
    bool? alreadySentInterest,
    bool? reportPending,
  }) {
    return PublicProfileState(
      profile: profile ?? this.profile,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      activeTab: activeTab ?? this.activeTab,
      posts: posts ?? this.posts,
      postsLoading: postsLoading ?? this.postsLoading,
      friends: friends ?? this.friends,
      friendsLoading: friendsLoading ?? this.friendsLoading,
      photos: photos ?? this.photos,
      photosLoading: photosLoading ?? this.photosLoading,
      videos: videos ?? this.videos,
      videosLoading: videosLoading ?? this.videosLoading,
      followStatus: followStatus ?? this.followStatus,
      followCounts: followCounts ?? this.followCounts,
      friendActionPending: friendActionPending ?? this.friendActionPending,
      followActionPending: followActionPending ?? this.followActionPending,
      sendInterestPending: sendInterestPending ?? this.sendInterestPending,
      alreadySentInterest: alreadySentInterest ?? this.alreadySentInterest,
      reportPending: reportPending ?? this.reportPending,
    );
  }
}
