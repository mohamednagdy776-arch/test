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