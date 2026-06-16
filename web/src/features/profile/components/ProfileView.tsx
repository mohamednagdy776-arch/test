'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { profileApi } from '../api';
import { ProfileHeader } from './ProfileHeader';
import { ProfileSection } from './ProfileSection';
import { ProfileEditForm } from './ProfileEditForm';
import { ProfileTabs, type Tab } from './ProfileTabs';
import { ActivityLogViewer } from './ActivityLogViewer';
import { PostCard } from '@/features/posts/components/PostCard';

interface Props {
  userId?: string;
}

export const ProfileView = ({ userId }: Props) => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('posts');

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

  // Friendship status — only when viewing another user
  const { data: friendStatusData } = useQuery({
    queryKey: ['friendship-status', profileUserId],
    queryFn: () => profileApi.getFriendshipStatus(profileUserId),
    enabled: !!userId && !!profileUserId,
  });
  const friendshipStatus = (friendStatusData as any)?.data ?? { status: 'none' };

  const sendRequest = useMutation({
    mutationFn: () => profileApi.sendFriendRequest(profileUserId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['friendship-status', profileUserId] }),
  });

  const cancelRequest = useMutation({
    mutationFn: () => {
      if (!friendshipStatus.id) throw new Error('No friend request id');
      return profileApi.cancelFriendRequest(friendshipStatus.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['friendship-status', profileUserId] }),
  });

  const acceptRequest = useMutation({
    mutationFn: () => {
      if (!friendshipStatus.id) throw new Error('No friend request id');
      return profileApi.acceptFriendRequest(friendshipStatus.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friendship-status', profileUserId] });
      qc.invalidateQueries({ queryKey: ['user-profile', userId] });
    },
  });

  const unfriend = useMutation({
    mutationFn: () => profileApi.unfriend(profileUserId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['friendship-status', profileUserId] }),
  });

  const friendActionPending =
    sendRequest.isPending || cancelRequest.isPending ||
    acceptRequest.isPending || unfriend.isPending;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-[#FDFAF5] animate-pulse border border-[#C8D8DF]/40" />
        ))}
      </div>
    );
  }

  // Distinguish a load failure (network/500) from a genuine 404 — otherwise an
  // error renders the "profile not found" message with no way to retry.
  if (isError) {
    return (
      <div className="rounded-xl bg-[#FDFAF5] border border-[#C8D8DF]/60 p-12 text-center">
        <p className="text-[#547792] text-sm mb-4">تعذّر تحميل الملف الشخصي</p>
        <button
          onClick={() => refetch()}
          className="rounded-xl border border-[#C8D8DF] px-4 py-2 text-sm text-[#213448] hover:bg-[#D4E8EE] transition-colors"
        >
          أعد المحاولة
        </button>
      </div>
    );
  }

  if (isSelf && (!hasProfile || editing)) {
    return (
      <ProfileEditForm
        initial={profile}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ['my-profile'] });
          setEditing(false);
        }}
        onCancel={hasProfile ? () => setEditing(false) : undefined}
      />
    );
  }

  if (!profile) {
    return (
      <div className="rounded-xl bg-[#FDFAF5] border border-[#C8D8DF]/60 p-12 text-center">
        <p className="text-[#547792] text-sm">لم يتم العثور على هذا الملف الشخصي</p>
      </div>
    );
  }

  const aboutContent = (
    <div className="space-y-4">
      <ProfileSection title="المعلومات الأساسية" icon="👤">
        <Grid items={[
          ['العمر', profile.age ? `${profile.age} سنة` : '—'],
          ['الجنس', profile.gender === 'male' ? 'ذكر' : profile.gender === 'female' ? 'أنثى' : '—'],
          ['الدولة', profile.country || '—'],
          ['المدينة', profile.city || '—'],
          ['الحالة الاجتماعية', profile.socialStatus || '—'],
          ['عدد الأطفال', String(profile.childrenCount ?? 0)],
        ]} />
        {profile.bio && (
          <p className="mt-3 text-sm text-gray-600 leading-relaxed border-t border-[#C8D8DF]/40 pt-3">
            {profile.bio}
          </p>
        )}
      </ProfileSection>

      <ProfileSection title="التعليم والعمل" icon="💼">
        <Grid items={[
          ['المستوى التعليمي', profile.education || '—'],
          ['المسمى الوظيفي', profile.jobTitle || '—'],
          ['المستوى المادي', profile.financialLevel || '—'],
          ['المستوى الثقافي', profile.culturalLevel || '—'],
          ['نمط الحياة', profile.lifestyle || '—'],
        ]} />
      </ProfileSection>

      <ProfileSection title="المعلومات الدينية" icon="🕌">
        <Grid items={[
          ['المذهب', profile.sect || '—'],
          ['مستوى الصلاة', profile.prayerLevel || '—'],
          ['الالتزام الديني', profile.religiousCommitment || '—'],
        ]} />
      </ProfileSection>

      {isSelf && (
        <ProfileSection title="تفضيلات الزواج" icon="💍">
          <Grid items={[
            ['الفئة العمرية المفضلة', profile.minAge && profile.maxAge ? `${profile.minAge} - ${profile.maxAge} سنة` : '—'],
            ['الدولة المفضلة', profile.preferredCountry || '—'],
            ['الانتقال للخارج', profile.relocateWilling === true ? 'نعم' : profile.relocateWilling === false ? 'لا' : '—'],
            ['رغبة في الإنجاب', profile.wantsChildren === true ? 'نعم' : profile.wantsChildren === false ? 'لا' : '—'],
          ]} />
        </ProfileSection>
      )}
    </div>
  );

  const placeholder = (label: string) => (
    <div className="rounded-xl bg-[#FDFAF5] border border-[#C8D8DF]/60 p-10 text-center">
      <p className="text-sm text-[#547792]">{label} قريباً</p>
    </div>
  );

  // Render only the active tab so each tab's query fires lazily when selected
  // (the old object literal instantiated every tab — incl. a guaranteed 403
  // from ActivityLogViewer — on every profile load).
  const renderTab = (): React.ReactNode => {
    switch (activeTab) {
      case 'about':    return aboutContent;
      case 'posts':    return profileUserId ? <ProfilePostsFeed userId={profileUserId} /> : placeholder('المنشورات');
      case 'friends':  return profileUserId ? <ProfileFriendsFeed userId={profileUserId} /> : placeholder('الأصدقاء');
      case 'photos':   return profileUserId ? <ProfilePhotosFeed userId={profileUserId} /> : placeholder('الصور');
      case 'videos':   return profileUserId ? <ProfileVideosFeed userId={profileUserId} /> : placeholder('الفيديوهات');
      // Activity log is private to its owner (server 403s for others).
      case 'activity': return isSelf && profileUserId ? <ActivityLogViewer userId={profileUserId} /> : placeholder('النشاط غير متاح');
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
        friendActionPending={!isSelf ? friendActionPending : false}
      />
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {renderTab()}
    </div>
  );
};

// Posts tab — fetches and renders the profile user's own posts. (Was a static
// "coming soon" placeholder; the backend GET /users/:id/posts is implemented.)
const ProfilePostsFeed = ({ userId }: { userId: string }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile-posts', userId],
    queryFn: () => apiClient.get(`/users/${userId}/posts`).then((r) => r.data),
    enabled: !!userId,
  });
  const posts: any[] = (data as any)?.data ?? [];

  const shell = (msg: string) => (
    <div className="rounded-xl bg-[#FDFAF5] border border-[#C8D8DF]/60 p-10 text-center">
      <p className="text-sm text-[#547792]">{msg}</p>
    </div>
  );

  if (isLoading) return shell('جاري تحميل المنشورات...');
  if (isError) return shell('تعذّر تحميل المنشورات');
  if (posts.length === 0) return shell('لا توجد منشورات');

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

const feedShell = (msg: string) => (
  <div className="rounded-xl bg-[#FDFAF5] border border-[#C8D8DF]/60 p-10 text-center">
    <p className="text-sm text-[#547792]">{msg}</p>
  </div>
);

// Friends grid for the profile "Friends" tab (was a placeholder).
const ProfileFriendsFeed = ({ userId }: { userId: string }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile-friends', userId],
    queryFn: () => profileApi.getFriends(userId),
    enabled: !!userId,
  });
  const friends: any[] = (data as any)?.data?.data ?? (data as any)?.data ?? [];
  if (isLoading) return feedShell('جاري تحميل الأصدقاء...');
  if (isError) return feedShell('تعذّر تحميل الأصدقاء');
  if (friends.length === 0) return feedShell('لا توجد أصدقاء');
  return (
    <div className="rounded-xl bg-[#FDFAF5] border border-[#C8D8DF]/60 p-6 grid grid-cols-3 gap-4">
      {friends.map((f: any, i: number) => (
        <a key={f.id ?? i} href={f.id ? `/profile/${f.id}` : '#'} className="rounded-lg bg-gray-50 p-3 text-center hover:bg-[#D4E8EE]/40 transition-colors">
          <div className="h-16 w-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
            {f.avatarUrl ? <img src={f.avatarUrl} alt="" className="h-full w-full object-cover" /> : <span className="text-xl font-bold text-[#547792]">{f.fullName?.charAt(0)}</span>}
          </div>
          <p className="mt-2 text-sm font-semibold text-gray-800 truncate">{f.fullName}</p>
        </a>
      ))}
    </div>
  );
};

// Photos grid for the profile "Photos" tab (was a placeholder).
const ProfilePhotosFeed = ({ userId }: { userId: string }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile-photos', userId],
    queryFn: () => profileApi.getPhotos(userId),
    enabled: !!userId,
  });
  const photos: any[] = (data as any)?.data?.data ?? [];
  if (isLoading) return feedShell('جاري تحميل الصور...');
  if (isError) return feedShell('تعذّر تحميل الصور');
  if (photos.length === 0) return feedShell('لا توجد صور');
  return (
    <div className="rounded-xl bg-[#FDFAF5] border border-[#C8D8DF]/60 p-6 grid grid-cols-4 gap-2">
      {photos.map((p: any, i: number) => (
        <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {p.metadata?.url && <img src={p.metadata.url} alt="" className="w-full h-full object-cover" />}
        </div>
      ))}
    </div>
  );
};

// Videos for the profile "Videos" tab (was a placeholder).
const ProfileVideosFeed = ({ userId }: { userId: string }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile-videos', userId],
    queryFn: () => profileApi.getVideos(userId),
    enabled: !!userId,
  });
  const videos: any[] = (data as any)?.data?.data ?? [];
  if (isLoading) return feedShell('جاري تحميل الفيديوهات...');
  if (isError) return feedShell('تعذّر تحميل الفيديوهات');
  if (videos.length === 0) return feedShell('لا توجد فيديوهات');
  return (
    <div className="rounded-xl bg-[#FDFAF5] border border-[#C8D8DF]/60 p-6 grid grid-cols-3 gap-4">
      {videos.map((v: any, i: number) => (
        <div key={i} className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center p-4">
          <p className="text-gray-500 text-center text-sm">{v.description}</p>
        </div>
      ))}
    </div>
  );
};

const Grid = ({ items }: { items: [string, string][] }) => (
  <div className="grid grid-cols-2 gap-3">
    {items.map(([k, v]) => (
      <div key={k} className="rounded-lg bg-gray-50 p-3">
        <dt className="text-xs font-medium text-gray-400">{k}</dt>
        <dd className="mt-0.5 text-sm font-semibold text-gray-800">{v}</dd>
      </div>
    ))}
  </div>
);
