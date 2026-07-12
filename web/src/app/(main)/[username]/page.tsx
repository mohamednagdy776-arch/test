'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { profileApi } from '@/features/profile/api';
import { resolveMediaUrl } from '@/lib/media';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfileSection } from '@/features/profile/components/ProfileSection';
import { ProfileTabs } from '@/features/profile/components/ProfileTabs';
import { ActivityLogViewer } from '@/features/profile/components/ActivityLogViewer';
import { PostCard } from '@/features/posts/components/PostCard';
import Link from 'next/link';

type Tab = 'posts' | 'about' | 'friends' | 'photos' | 'videos' | 'activity';

// Only render http(s) website links — never javascript:/data: URIs (stored XSS).
const safeWebsite = (url?: string) => (url && /^https?:\/\//i.test(url) ? url : null);

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const [activeTab, setActiveTab] = useState<Tab>('posts');

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['user-profile', username],
    queryFn: () => apiClient.get(`/users/${username}`).then((r) => r.data),
    enabled: !!username,
    staleTime: 60_000,
  });

  const profile = (profileData as any)?.data;
  const qc = useQueryClient();
  const profileUserId: string = profile?.userId ?? '';
  const isSelf = !!profile?.isSelf;

  const { data: friendStatusData } = useQuery({
    queryKey: ['friendship-status', profileUserId],
    queryFn: () => profileApi.getFriendshipStatus(profileUserId),
    enabled: !isSelf && !!profileUserId,
  });
  const friendshipStatus = (friendStatusData as any)?.data ?? { status: 'none' };

  const inval = () => qc.invalidateQueries({ queryKey: ['friendship-status', profileUserId] });
  const sendRequest   = useMutation({ mutationFn: () => profileApi.sendFriendRequest(profileUserId), onSuccess: inval });
  const cancelRequest = useMutation({ mutationFn: () => { if (!friendshipStatus.id) throw new Error('no id'); return profileApi.cancelFriendRequest(friendshipStatus.id); }, onSuccess: inval });
  const acceptRequest = useMutation({ mutationFn: () => { if (!friendshipStatus.id) throw new Error('no id'); return profileApi.acceptFriendRequest(friendshipStatus.id); }, onSuccess: inval });
  const unfriend      = useMutation({ mutationFn: () => profileApi.unfriend(profileUserId), onSuccess: inval });
  const blockUser     = useMutation({ mutationFn: () => profileApi.blockUser(profileUserId), onSuccess: inval });
  const friendActionPending = sendRequest.isPending || cancelRequest.isPending || acceptRequest.isPending || unfriend.isPending;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-64 rounded-2xl bg-[var(--card)] animate-pulse border border-[var(--border)]" />
        <div className="h-96 rounded-2xl bg-[var(--card)] animate-pulse border border-[var(--border)]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">👤</p>
        <p className="text-[var(--primary)] font-medium">المستخدم غير موجود</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ProfileHeader
        profile={profile}
        isSelf={isSelf}
        onEdit={isSelf ? () => router.push('/profile') : undefined}
        friendshipStatus={!isSelf ? friendshipStatus : undefined}
        onAddFriend={!isSelf ? () => sendRequest.mutate() : undefined}
        onCancelRequest={!isSelf ? () => cancelRequest.mutate() : undefined}
        onAcceptRequest={!isSelf ? () => acceptRequest.mutate() : undefined}
        onUnfriend={!isSelf ? () => unfriend.mutate() : undefined}
        onBlock={!isSelf ? () => blockUser.mutate() : undefined}
        friendActionPending={!isSelf ? friendActionPending : false}
      />
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="min-h-[400px]">
        {activeTab === 'posts'    && <PostsTab    userId={profile.userId} />}
        {activeTab === 'about'    && <AboutTab    profile={profile} />}
        {activeTab === 'friends'  && <FriendsTab  userId={profile.userId} />}
        {activeTab === 'photos'   && <PhotosTab   userId={profile.userId} />}
        {activeTab === 'videos'   && <VideosTab   userId={profile.userId} />}
        {activeTab === 'activity' && (isSelf
          ? <ActivityLogViewer userId={profile.userId} />
          : <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-8 text-center text-[var(--primary)]">🔒 النشاط خاص</div>
        )}
      </div>
    </div>
  );
}

function PostsTab({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const { data, isLoading, isError } = useQuery({
    queryKey: ['user-posts', userId, page],
    queryFn: () => apiClient.get(`/users/${userId}/posts`, { params: { page, limit: PAGE_SIZE } }).then((r) => r.data),
    enabled: !!userId,
  });

  const posts: any[] = (data as any)?.data?.data ?? (data as any)?.data ?? [];
  const total: number = (data as any)?.data?.total ?? posts.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 rounded-2xl bg-[var(--card)] animate-pulse border border-[var(--border)]" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-8 text-center">
        <p className="text-2xl mb-2">⚠️</p>
        <p className="text-[var(--primary)] text-sm">فشل تحميل المنشورات</p>
      </div>
    );
  }

  if (posts.length === 0 && page === 1) {
    return (
      <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-10 text-center">
        <p className="text-3xl mb-2">📝</p>
        <p className="text-[var(--primary)]">لا توجد منشورات</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post: any) => (
        <PostCard key={post.id} post={post} />
      ))}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--primary)] border border-[var(--border)] hover:bg-[var(--muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            السابق
          </button>
          <span className="text-sm text-[var(--primary)]">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--primary)] border border-[var(--border)] hover:bg-[var(--muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}

function AboutTab({ profile }: { profile: any }) {
  return (
    <div className="space-y-4">
      <ProfileSection title="العمل" icon="💼">
        {profile.workEntries?.length > 0 ? (
          <div className="space-y-3">
            {profile.workEntries.map((work: any, i: number) => (
              <div key={i} className="rounded-xl bg-[var(--muted)] border border-[var(--border)] p-4">
                <p className="font-semibold text-[var(--foreground)]">{work.company}</p>
                <p className="text-sm text-[var(--primary)]">{work.position}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  {work.startDate} - {work.isCurrent ? 'حتى الآن' : work.endDate}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[var(--primary)] text-sm">لم تتم إضافة معلومات العمل</p>
        )}
      </ProfileSection>

      <ProfileSection title="التعليم" icon="🎓">
        {profile.educationEntries?.length > 0 ? (
          <div className="space-y-3">
            {profile.educationEntries.map((edu: any, i: number) => (
              <div key={i} className="rounded-xl bg-[var(--muted)] border border-[var(--border)] p-4">
                <p className="font-semibold text-[var(--foreground)]">{edu.school}</p>
                <p className="text-sm text-[var(--primary)]">{edu.degree}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  {edu.startYear} - {edu.endYear}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[var(--primary)] text-sm">لم تتم إضافة معلومات التعليم</p>
        )}
      </ProfileSection>

      <ProfileSection title="معلومات أساسية" icon="ℹ️">
        <div className="grid grid-cols-2 gap-3">
          {profile.age && (
            <div className="rounded-xl bg-[var(--muted)] border border-[var(--border)] p-3">
              <p className="text-xs text-[var(--muted-foreground)] mb-0.5">العمر</p>
              <p className="text-sm font-semibold text-[var(--foreground)]">{profile.age} سنة</p>
            </div>
          )}
          {profile.relationshipStatus && (
            <div className="rounded-xl bg-[var(--muted)] border border-[var(--border)] p-3">
              <p className="text-xs text-[var(--muted-foreground)] mb-0.5">الحالة الاجتماعية</p>
              <p className="text-sm font-semibold text-[var(--foreground)]">{profile.relationshipStatus}</p>
            </div>
          )}
          {profile.location && (
            <div className="rounded-xl bg-[var(--muted)] border border-[var(--border)] p-3">
              <p className="text-xs text-[var(--muted-foreground)] mb-0.5">الموقع</p>
              <p className="text-sm font-semibold text-[var(--foreground)]">{profile.location}</p>
            </div>
          )}
          {safeWebsite(profile.website) && (
            <div className="rounded-xl bg-[var(--muted)] border border-[var(--border)] p-3 col-span-2">
              <p className="text-xs text-[var(--muted-foreground)] mb-0.5">الموقع الإلكتروني</p>
              <a
                href={safeWebsite(profile.website)!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-[var(--primary)] hover:underline"
              >
                {profile.website}
              </a>
            </div>
          )}
        </div>
      </ProfileSection>
    </div>
  );
}

function FriendsTab({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;
  const { data, isLoading, isError } = useQuery({
    queryKey: ['friends', userId, page],
    queryFn: () => apiClient.get(`/users/${userId}/friends`, { params: { page, limit: PAGE_SIZE } }).then((r) => r.data),
    enabled: !!userId,
  });

  const friends = (data as any)?.data?.data || [];
  const total: number = (data as any)?.data?.total ?? friends.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="rounded-2xl bg-[var(--card)] animate-pulse border border-[var(--border)] h-28" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-8 text-center">
        <p className="text-[var(--primary)] text-sm">تعذّر تحميل الأصدقاء</p>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-10 text-center">
        <p className="text-3xl mb-2">👥</p>
        <p className="text-[var(--primary)]">لا توجد أصدقاء</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {friends.map((friend: any, i: number) => (
          <Link key={i} href={friend.username ? `/${friend.username}` : '#'} className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 text-center shadow-sm hover:shadow-md hover:shadow-black/5 transition-all">
            <div className="h-16 w-16 mx-auto rounded-full bg-[var(--muted)] flex items-center justify-center mb-2">
              {friend.avatarUrl ? (
                <img src={resolveMediaUrl(friend.avatarUrl) ?? ''} alt="" className="h-full w-full object-cover rounded-full" />
              ) : (
                <span className="text-xl font-bold text-[var(--primary)]">{friend.fullName?.charAt(0)}</span>
              )}
            </div>
            <p className="text-sm font-semibold text-[var(--foreground)] truncate">{friend.fullName}</p>
            {friend.mutualFriends > 0 && (
              <p className="text-xs text-[var(--primary)] mt-0.5">{friend.mutualFriends} مشترك</p>
            )}
          </Link>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--primary)] border border-[var(--border)] hover:bg-[var(--muted)] disabled:opacity-40 transition-colors">السابق</button>
          <span className="text-sm text-[var(--primary)]">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--primary)] border border-[var(--border)] hover:bg-[var(--muted)] disabled:opacity-40 transition-colors">التالي</button>
        </div>
      )}
    </div>
  );
}

function PhotosTab({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const { data, isLoading, isError } = useQuery({
    queryKey: ['photos', userId, page],
    queryFn: () => apiClient.get(`/users/${userId}/photos`, { params: { page, limit: PAGE_SIZE } }).then((r) => r.data),
    enabled: !!userId,
  });

  const photos = (data as any)?.data?.data || [];
  const total: number = (data as any)?.data?.total ?? photos.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="aspect-square bg-[var(--muted)]/60 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-8 text-center">
        <p className="text-[var(--primary)] text-sm">تعذّر تحميل الصور</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-10 text-center">
        <p className="text-3xl mb-2">🖼️</p>
        <p className="text-[var(--primary)]">لا توجد صور</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {photos.map((photo: any, i: number) => {
          // Only ever checked metadata.url, but avatar/cover updates store
          // avatarUrl/coverUrl instead -- every tile rendered blank (#366).
          const photoUrl = photo.metadata?.url ?? photo.metadata?.coverUrl ?? photo.metadata?.avatarUrl ?? photo.metadata?.mediaUrl ?? null;
          if (!photoUrl) return null;
          return (
            <div key={i} className="aspect-square bg-[var(--muted)]/40 rounded-xl overflow-hidden border border-[var(--border)]">
              <img src={resolveMediaUrl(photoUrl) ?? ''} alt="" className="w-full h-full object-cover" />
            </div>
          );
        })}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--primary)] border border-[var(--border)] hover:bg-[var(--muted)] disabled:opacity-40 transition-colors">السابق</button>
          <span className="text-sm text-[var(--primary)]">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--primary)] border border-[var(--border)] hover:bg-[var(--muted)] disabled:opacity-40 transition-colors">التالي</button>
        </div>
      )}
    </div>
  );
}

function VideosTab({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;
  const { data, isLoading, isError } = useQuery({
    queryKey: ['videos', userId, page],
    queryFn: () => apiClient.get(`/users/${userId}/videos`, { params: { page, limit: PAGE_SIZE } }).then((r) => r.data),
    enabled: !!userId,
  });

  const videos = (data as any)?.data?.data || [];
  const total: number = (data as any)?.data?.total ?? videos.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="aspect-video bg-[var(--muted)]/60 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-8 text-center">
        <p className="text-[var(--primary)] text-sm">تعذّر تحميل الفيديوهات</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-10 text-center">
        <p className="text-3xl mb-2">🎬</p>
        <p className="text-[var(--primary)]">لا توجد فيديوهات</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {videos.map((video: any) => (
          <Link key={video.id} href={`/watch/${video.id}`} className="group relative aspect-video bg-[var(--muted)]/40 rounded-xl overflow-hidden border border-[var(--border)]">
            {video.thumbnail ? (
              <img src={resolveMediaUrl(video.thumbnail) ?? ''} alt={video.title || ''} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">🎬</div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all">
              <span className="text-white opacity-0 group-hover:opacity-100 text-2xl transition-opacity">▶️</span>
            </div>
            {video.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-2">
                <p className="text-white text-xs line-clamp-1">{video.title}</p>
              </div>
            )}
          </Link>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--primary)] border border-[var(--border)] hover:bg-[var(--muted)] disabled:opacity-40 transition-colors">السابق</button>
          <span className="text-sm text-[var(--primary)]">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--primary)] border border-[var(--border)] hover:bg-[var(--muted)] disabled:opacity-40 transition-colors">التالي</button>
        </div>
      )}
    </div>
  );
}
