'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
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

  // Friendship status is now embedded in the profile response (Issue #429)
  const friendshipStatus = profile?.friendshipStatus ?? { status: 'none' };

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

  const blockUser = useMutation({
    mutationFn: () => profileApi.blockUser(profileUserId),
    onSuccess: () => qc.invalidateQueries({ queryKey: userId ? ['user-profile', userId] : ['my-profile'] }),
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
        onBlock={!isSelf ? () => blockUser.mutate() : undefined}
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
    <div className="rounded-xl bg-[#FDFAF5] border border-[#C8D8DF]/60 p-10 text-center">
      <p className="text-sm text-[#547792]">{msg}</p>
    </div>
  );

  if (isLoading) return shell('جاري تحميل المنشورات...');
  if (isError) return shell('تعذّر تحميل المنشورات');
  if (posts.length === 0 && page === 1) return shell('لا توجد منشورات');

  return (
    <div className="space-y-4">
      {posts.map((post: any) => (
        <PostCard key={post.id} post={post} />
      ))}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-xl text-sm font-medium text-[#547792] border border-[#C8D8DF] hover:bg-[#D4E8EE]/40 disabled:opacity-40 transition-colors">السابق</button>
          <span className="text-sm text-[#547792]">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-4 py-2 rounded-xl text-sm font-medium text-[#547792] border border-[#C8D8DF] hover:bg-[#D4E8EE]/40 disabled:opacity-40 transition-colors">التالي</button>
        </div>
      )}
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
        <Link key={f.id ?? i} href={f.username ? `/${f.username}` : f.id ? `/profile/${f.id}` : '#'} className="rounded-lg bg-gray-50 p-3 text-center hover:bg-[#D4E8EE]/40 transition-colors">
          <div className="h-16 w-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
            {f.avatarUrl ? <img src={f.avatarUrl} alt="" className="h-full w-full object-cover" /> : <span className="text-xl font-bold text-[#547792]">{f.fullName?.charAt(0)}</span>}
          </div>
          <p className="mt-2 text-sm font-semibold text-gray-800 truncate">{f.fullName}</p>
        </Link>
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
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  return (
    <>
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            aria-label="إغلاق"
            className="absolute top-4 left-4 text-white text-2xl hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
          <img
            src={lightboxUrl}
            alt=""
            className="max-w-full max-h-full rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      <div className="rounded-xl bg-[#FDFAF5] border border-[#C8D8DF]/60 p-6 grid grid-cols-4 gap-2">
        {photos.map((p: any, i: number) =>
          p.metadata?.url ? (
            <button
              key={i}
              onClick={() => setLightboxUrl(p.metadata.url)}
              className="aspect-square bg-gray-100 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#547792]"
              aria-label={`عرض الصورة ${i + 1}`}
            >
              <img src={p.metadata.url} alt="" className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
            </button>
          ) : (
            <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden" />
          )
        )}
      </div>
    </>
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
    <div className="rounded-xl bg-[#FDFAF5] border border-[#C8D8DF]/60 p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
      {videos.map((v: any, i: number) => (
        <Link key={v.id ?? i} href={`/watch/${v.id}`} className="group relative aspect-video bg-gray-100 rounded-lg overflow-hidden block hover:opacity-90 transition-opacity">
          {v.thumbnail ? (
            <img src={v.thumbnail} alt={v.title || ''} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl text-gray-400">🎬</div>
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
      <div key={k} className="rounded-lg bg-gray-50 p-3">
        <dt className="text-xs font-medium text-gray-400">{k}</dt>
        <dd className="mt-0.5 text-sm font-semibold text-gray-800">{v}</dd>
      </div>
    ))}
  </div>
);
