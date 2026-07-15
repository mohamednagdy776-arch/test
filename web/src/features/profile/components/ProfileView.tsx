'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { profileApi } from '../api';
import { ProfileHeader } from './ProfileHeader';
import { ProfileSection } from './ProfileSection';
import { ProfileEditForm } from './ProfileEditForm';
import { ProfileTabs, type Tab } from './ProfileTabs';
import { ActivityLogViewer } from './ActivityLogViewer';
import { ReportUserModal } from './ReportUserModal';
import { PostCard } from '@/features/posts/components/PostCard';
import { resolveMediaUrl } from '@/lib/media';
import { useToast } from '@/components/ui/Toast';
import { interestsApi } from '@/features/interests/api';
import { useT } from '@/i18n/I18nProvider';
import {
  socialStatusLabel, educationLabel, lifestyleLabel,
  sectLabel, prayerLevelLabel, religiousCommitmentLabel,
  financialLevelLabel, culturalLevelLabel,
} from '../labels';

interface Props {
  userId?: string;
}

export const ProfileView = ({ userId }: Props) => {
  const qc = useQueryClient();
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useT();
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [reportOpen, setReportOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: userId ? ['user-profile', userId] : ['my-profile'],
    queryFn: () =>
      userId
        ? apiClient.get(`/users/${userId}`).then((r) => r.data)
        : apiClient.get('/users/me').then((r) => r.data),
    // Serve cached profile data between navigations instead of re-fetching on
    // every visit (#431); edits still invalidate this key for freshness.
    staleTime: 60_000,
  });

  const profile = (data as any)?.data ?? null;
  const isSelf = !userId || profile?.isSelf === true;
  // A profile counts as "started" if any meaningful field is set — not only
  // fullName, which OAuth users may never have (else they're stuck in edit mode).
  const hasProfile = !!profile && ['fullName', 'age', 'gender', 'sect', 'education', 'city', 'country', 'bio']
    .some((k) => (profile as any)[k]);
  const profileUserId: string = profile?.userId ?? userId ?? '';

  // Friendship status is now embedded in the profile response (Issue #429)
  const friendshipStatus = profile?.friendshipStatus ?? { status: 'none' };

  // friendshipStatus is embedded in the profile response (#429), driven by
  // ['user-profile', userId] / ['my-profile'] — but these mutations only
  // invalidated a stale, unsubscribed ['friendship-status', profileUserId]
  // key left over from before that change, so the Add Friend/pending state
  // never updated after a successful action, letting the user click it
  // repeatedly (#120). Match acceptRequest/blockUser's invalidation below.
  const profileQueryKey = userId ? ['user-profile', userId] : ['my-profile'];

  const sendRequest = useMutation({
    mutationFn: () => profileApi.sendFriendRequest(profileUserId),
    onSuccess: () => qc.invalidateQueries({ queryKey: profileQueryKey }),
  });

  const cancelRequest = useMutation({
    mutationFn: () => {
      if (!friendshipStatus.id) throw new Error('No friend request id');
      return profileApi.cancelFriendRequest(friendshipStatus.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: profileQueryKey }),
  });

  const acceptRequest = useMutation({
    mutationFn: () => {
      if (!friendshipStatus.id) throw new Error('No friend request id');
      return profileApi.acceptFriendRequest(friendshipStatus.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friendship-status', profileUserId] });
      qc.invalidateQueries({ queryKey: profileQueryKey });
    },
  });

  const unfriend = useMutation({
    mutationFn: () => profileApi.unfriend(profileUserId),
    onSuccess: () => qc.invalidateQueries({ queryKey: profileQueryKey }),
  });

  const blockUser = useMutation({
    mutationFn: () => profileApi.blockUser(profileUserId),
    // Blocking makes this profile immediately inaccessible (getFullProfile
    // returns null -> the controller 404s), but this used to just invalidate
    // the same still-mounted ['user-profile', userId] query -- the refetch
    // then permanently 404'd and the page got stuck showing the generic
    // "failed to load" error/retry box forever (#276). Navigate away instead.
    onSuccess: () => {
      showToast(t('profileView.userBlockedToast'), 'success');
      router.push('/friends');
    },
  });

  // Send Salam — directed marriage-intent interest (#754).
  // The button never showed whether a Salam had already been sent -- it just
  // re-enabled itself identically once the request finished (#314).
  const { data: sentInterestsData } = useQuery({
    queryKey: ['sent-interests'],
    queryFn: () => interestsApi.sent(),
    enabled: !isSelf,
  });
  const alreadySentInterest = (sentInterestsData as any)?.data?.some((r: any) => r.user?.id === profileUserId) ?? false;
  const sendInterest = useMutation({
    mutationFn: () => interestsApi.send(profileUserId),
    onSuccess: (res: any) => {
      showToast(res?.message || t('profileView.interestSentToast'), 'success');
      qc.invalidateQueries({ queryKey: ['sent-interests'] });
    },
    onError: () => showToast(t('profileView.interestSendError'), 'error'),
  });

  // Request to view private/on-request photos (#752).
  const requestPhotos = useMutation({
    mutationFn: () => profileApi.requestPhotoAccess(profileUserId),
    onSuccess: (res: any) => showToast(res?.message || t('profileView.photoRequestSentToast'), 'success'),
    onError: () => showToast(t('profileView.photoRequestError'), 'error'),
  });

  const friendActionPending =
    sendRequest.isPending || cancelRequest.isPending ||
    acceptRequest.isPending || unfriend.isPending;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-[var(--card)] animate-pulse border border-[var(--border)]/40" />
        ))}
      </div>
    );
  }

  // Distinguish a load failure (network/500) from a genuine 404 — otherwise an
  // error renders the "profile not found" message with no way to retry.
  if (isError) {
    return (
      <div className="rounded-xl bg-[var(--card)] border border-[var(--border)]/60 p-12 text-center">
        <p className="text-[var(--muted-foreground)] text-sm mb-4">{t('profileView.loadError')}</p>
        <button
          onClick={() => refetch()}
          className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
        >
          {t('profileView.retry')}
        </button>
      </div>
    );
  }

  if (isSelf && (!hasProfile || editing)) {
    return (
      <div className="space-y-6">
        {/* The cover/avatar camera-icon upload (immediate-upload, not tied to
            Save) only exists on ProfileHeader — replacing the whole view with
            just the text form made it unreachable while editing, so a picked
            banner appeared to do nothing on Save (#81). */}
        <ProfileHeader profile={profile} isSelf={isSelf} />
        <ProfileEditForm
          initial={profile}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ['my-profile'] });
            setEditing(false);
          }}
          onCancel={hasProfile ? () => setEditing(false) : undefined}
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-xl bg-[var(--card)] border border-[var(--border)]/60 p-12 text-center">
        <p className="text-[var(--muted-foreground)] text-sm">{t('profileView.notFound')}</p>
      </div>
    );
  }

  const aboutContent = (
    <div className="space-y-4">
      <ProfileSection title={t('profileView.section.basicInfo')} icon="👤">
        <Grid items={[
          [t('profileView.field.age'), profile.age ? t('dashboard.ageLabel', { age: profile.age }) : '—'],
          [t('profileView.field.gender'), profile.gender === 'male' ? 'ذكر' : profile.gender === 'female' ? 'أنثى' : '—'],
          [t('profileView.field.country'), profile.country || '—'],
          [t('profileView.field.city'), profile.city || '—'],
          [t('profileView.field.socialStatus'), socialStatusLabel(profile.socialStatus)],
          [t('profileView.field.childrenCount'), String(profile.childrenCount ?? 0)],
        ]} />
        {profile.bio && (
          // dir="auto" so an LTR bio in this RTL container aligns and puts
          // punctuation on the correct side (#738).
          <p dir="auto" className="mt-3 text-sm text-[var(--muted-foreground)] leading-relaxed border-t border-[var(--border)]/40 pt-3">
            {profile.bio}
          </p>
        )}
      </ProfileSection>

      <ProfileSection title={t('profileView.section.educationWork')} icon="💼">
        <Grid items={[
          [t('profileView.field.educationLevel'), educationLabel(profile.education)],
          [t('profileView.field.jobTitle'), profile.jobTitle || '—'],
          [t('profileView.field.financialLevel'), financialLevelLabel(profile.financialLevel)],
          [t('profileView.field.culturalLevel'), culturalLevelLabel(profile.culturalLevel)],
          [t('profileView.field.lifestyle'), lifestyleLabel(profile.lifestyle)],
        ]} />
      </ProfileSection>

      <ProfileSection title={t('profileView.section.religiousInfo')} icon="🕌">
        <Grid items={[
          [t('profileView.field.sect'), sectLabel(profile.sect)],
          [t('profileView.field.prayerLevel'), prayerLevelLabel(profile.prayerLevel)],
          [t('profileView.field.religiousCommitment'), religiousCommitmentLabel(profile.religiousCommitment)],
        ]} />
      </ProfileSection>

      {isSelf && (
        <ProfileSection title={t('profileView.section.marriagePrefs')} icon="💍">
          <Grid items={[
            [t('profileView.field.preferredAgeRange'), profile.minAge && profile.maxAge ? t('profileView.ageRangeValue', { min: profile.minAge, max: profile.maxAge }) : '—'],
            [t('profileView.field.preferredCountry'), profile.preferredCountry || '—'],
            [t('profileView.field.relocateWilling'), profile.relocateWilling === true ? t('profileView.yes') : profile.relocateWilling === false ? t('profileView.no') : '—'],
            [t('profileView.field.wantsChildren'), profile.wantsChildren === true ? t('profileView.yes') : profile.wantsChildren === false ? t('profileView.no') : '—'],
          ]} />
        </ProfileSection>
      )}
    </div>
  );

  const placeholder = (label: string) => (
    <div className="rounded-xl bg-[var(--card)] border border-[var(--border)]/60 p-10 text-center">
      <p className="text-sm text-[var(--muted-foreground)]">{label} {t('profileView.comingSoon')}</p>
    </div>
  );

  // Render only the active tab so each tab's query fires lazily when selected
  // (the old object literal instantiated every tab — incl. a guaranteed 403
  // from ActivityLogViewer — on every profile load).
  const renderTab = (): React.ReactNode => {
    switch (activeTab) {
      case 'about':    return aboutContent;
      case 'posts':    return profileUserId ? <ProfilePostsFeed userId={profileUserId} /> : placeholder(t('profileView.tabName.posts'));
      case 'friends':  return profileUserId ? <ProfileFriendsFeed userId={profileUserId} /> : placeholder(t('profileView.tabName.friends'));
      case 'photos':   return profileUserId ? <ProfilePhotosFeed userId={profileUserId} /> : placeholder(t('profileView.tabName.photos'));
      case 'videos':   return profileUserId ? <ProfileVideosFeed userId={profileUserId} /> : placeholder(t('profileView.tabName.videos'));
      // Activity log is private to its owner (server 403s for others).
      case 'activity': return isSelf && profileUserId ? <ActivityLogViewer userId={profileUserId} /> : placeholder(t('profileView.tabName.activityUnavailable'));
      default:         return null;
    }
  };

  return (
    <div className="space-y-4">
      <ProfileHeader
        profile={profile}
        isSelf={isSelf}
        onEdit={isSelf ? () => setEditing(true) : undefined}
        friendshipStatus={!isSelf ? friendshipStatus : undefined}
        onAddFriend={!isSelf ? () => sendRequest.mutate() : undefined}
        onCancelRequest={!isSelf ? () => cancelRequest.mutate() : undefined}
        onAcceptRequest={!isSelf ? () => acceptRequest.mutate() : undefined}
        onUnfriend={!isSelf ? () => unfriend.mutate() : undefined}
        onBlock={!isSelf ? () => blockUser.mutate() : undefined}
        onReport={!isSelf ? () => setReportOpen(true) : undefined}
        onSendInterest={!isSelf ? () => sendInterest.mutate() : undefined}
        sendInterestPending={sendInterest.isPending}
        alreadySentInterest={alreadySentInterest}
        friendActionPending={!isSelf ? friendActionPending : false}
      />
      {!isSelf && (profile as any)?.photoLocked && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <span className="text-lg">🔒</span>
            <span>{t('profileView.photosLockedMessage')}</span>
          </div>
          <button
            onClick={() => requestPhotos.mutate()}
            disabled={requestPhotos.isPending}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] disabled:opacity-50 transition-all"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
          >
            {requestPhotos.isPending ? '...' : t('profileView.requestPhotosButton')}
          </button>
        </div>
      )}
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {renderTab()}
      {!isSelf && profileUserId && (
        <ReportUserModal
          userId={profileUserId}
          userName={(profile as any)?.fullName}
          open={reportOpen}
          onClose={() => setReportOpen(false)}
        />
      )}
    </div>
  );
};

// Posts tab — fetches and renders the profile user's own posts. (Was a static
// "coming soon" placeholder; the backend GET /users/:id/posts is implemented.)
const ProfilePostsFeed = ({ userId }: { userId: string }) => {
  const { t } = useT();
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile-posts', userId, page],
    queryFn: () => apiClient.get(`/users/${userId}/posts`, { params: { page, limit: PAGE_SIZE } }).then((r) => r.data),
    enabled: !!userId,
  });
  const posts: any[] = (data as any)?.data?.data ?? (data as any)?.data ?? [];
  const total: number = (data as any)?.data?.total ?? posts.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const shell = (msg: string) => (
    <div className="rounded-xl bg-[var(--card)] border border-[var(--border)]/60 p-10 text-center">
      <p className="text-sm text-[var(--muted-foreground)]">{msg}</p>
    </div>
  );

  if (isLoading) return shell(t('profileView.posts.loading'));
  if (isError) return shell(t('profileView.posts.loadError'));
  if (posts.length === 0 && page === 1) return shell(t('profileView.posts.empty'));

  return (
    <div className="space-y-4">
      {posts.map((post: any) => (
        <PostCard key={post.id} post={post} />
      ))}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--muted-foreground)] border border-[var(--border)] hover:bg-[var(--muted)]/40 disabled:opacity-40 transition-colors">{t('profileView.pagination.prev')}</button>
          <span className="text-sm text-[var(--muted-foreground)]">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--muted-foreground)] border border-[var(--border)] hover:bg-[var(--muted)]/40 disabled:opacity-40 transition-colors">{t('profileView.pagination.next')}</button>
        </div>
      )}
    </div>
  );
};

const feedShell = (msg: string) => (
  <div className="rounded-xl bg-[var(--card)] border border-[var(--border)]/60 p-10 text-center">
    <p className="text-sm text-[var(--muted-foreground)]">{msg}</p>
  </div>
);

// Friends grid for the profile "Friends" tab (was a placeholder).
const ProfileFriendsFeed = ({ userId }: { userId: string }) => {
  const { t } = useT();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile-friends', userId],
    queryFn: () => profileApi.getFriends(userId),
    enabled: !!userId,
  });
  const friends: any[] = (data as any)?.data?.data ?? (data as any)?.data ?? [];
  if (isLoading) return feedShell(t('profileView.friends.loading'));
  if (isError) return feedShell(t('profileView.friends.loadError'));
  if (friends.length === 0) return feedShell(t('profileView.friends.empty'));
  return (
    // Fixed 3-column grid with no mobile breakpoint squeezed avatars/tiles on
    // narrow phones (#166) -- the newer [username] route already uses a
    // mobile-first 2-col base for this same list.
    <div className="rounded-xl bg-[var(--card)] border border-[var(--border)]/60 p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
      {friends.map((f: any, i: number) => (
        <Link key={f.id ?? i} href={f.username ? `/${f.username}` : f.id ? `/profile/${f.id}` : '#'} className="rounded-lg bg-[var(--muted)] p-3 text-center hover:bg-[var(--muted)]/40 transition-colors">
          <div className="h-16 w-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
            {f.avatarUrl ? <img src={resolveMediaUrl(f.avatarUrl) ?? ''} alt="" className="h-full w-full object-cover" /> : <span className="text-xl font-bold text-[var(--muted-foreground)]">{f.fullName?.charAt(0)}</span>}
          </div>
          <p className="mt-2 text-sm font-semibold text-[var(--foreground)] truncate">{f.fullName}</p>
        </Link>
      ))}
    </div>
  );
};

// Photos grid for the profile "Photos" tab (was a placeholder).
const ProfilePhotosFeed = ({ userId }: { userId: string }) => {
  const { t } = useT();
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile-photos', userId],
    queryFn: () => profileApi.getPhotos(userId),
    enabled: !!userId,
  });
  const photos: any[] = (data as any)?.data?.data ?? [];
  if (isLoading) return feedShell(t('profileView.photos.loading'));
  if (isError) return feedShell(t('profileView.photos.loadError'));
  if (photos.length === 0) return feedShell(t('profileView.photos.empty'));
  return (
    <>
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            aria-label={t('profile.close')}
            className="absolute top-4 left-4 text-white text-2xl hover:text-[var(--muted-foreground)]/70 transition-colors"
          >
            ✕
          </button>
          <img
            src={resolveMediaUrl(lightboxUrl) ?? ''}
            alt=""
            className="max-w-full max-h-full rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      {/* Fixed 4-column grid with no mobile breakpoint (#166) — matches the
          [username] route's mobile-first 3-col base for this same list. */}
      <div className="rounded-xl bg-[var(--card)] border border-[var(--border)]/60 p-6 grid grid-cols-3 sm:grid-cols-4 gap-2">
        {photos.map((p: any, i: number) => {
          const photoUrl = p.metadata?.url ?? p.metadata?.coverUrl ?? p.metadata?.avatarUrl ?? p.metadata?.mediaUrl ?? null;
          // Photo-removal activity rows (and any other legacy row logged with
          // no media reference) have nothing to show — skip them instead of
          // rendering a permanent blank placeholder tile (#90, #91).
          if (!photoUrl) return null;
          return (
            <button
              key={i}
              onClick={() => setLightboxUrl(photoUrl)}
              className="aspect-square bg-[var(--muted)] rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              aria-label={t('profileView.viewPhotoAria', { n: i + 1 })}
            >
              <img src={resolveMediaUrl(photoUrl) ?? ''} alt="" className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
            </button>
          );
        })}
      </div>
    </>
  );
};

// Videos for the profile "Videos" tab (was a placeholder).
const ProfileVideosFeed = ({ userId }: { userId: string }) => {
  const { t } = useT();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile-videos', userId],
    queryFn: () => profileApi.getVideos(userId),
    enabled: !!userId,
  });
  const videos: any[] = (data as any)?.data?.data ?? [];
  if (isLoading) return feedShell(t('profileView.videos.loading'));
  if (isError) return feedShell(t('profileView.videos.loadError'));
  if (videos.length === 0) return feedShell(t('profileView.videos.empty'));
  return (
    <div className="rounded-xl bg-[var(--card)] border border-[var(--border)]/60 p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
      {videos.map((v: any, i: number) => (
        <Link key={v.id ?? i} href={`/watch/${v.id}`} className="group relative aspect-video bg-[var(--muted)] rounded-lg overflow-hidden block hover:opacity-90 transition-opacity">
          {v.thumbnail ? (
            <img src={resolveMediaUrl(v.thumbnail) ?? ''} alt={v.title || ''} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl text-[var(--muted-foreground)]">🎬</div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all">
            <span className="text-white opacity-0 group-hover:opacity-100 text-2xl">▶️</span>
          </div>
          {v.title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-2">
              <p className="text-white text-xs line-clamp-1">{v.title}</p>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
};

const Grid = ({ items }: { items: [string, string][] }) => (
  <div className="grid grid-cols-2 gap-3">
    {items.map(([k, v]) => (
      <div key={k} className="rounded-lg bg-[var(--muted)] p-3">
        <dt className="text-xs font-medium text-[var(--muted-foreground)]">{k}</dt>
        <dd className="mt-0.5 text-sm font-semibold text-[var(--foreground)]">{v}</dd>
      </div>
    ))}
  </div>
);
