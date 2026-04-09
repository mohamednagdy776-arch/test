'use client';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfileSection } from '@/features/profile/components/ProfileSection';
import { ProfileTabs } from '@/features/profile/components/ProfileTabs';
import { ActivityLogViewer } from '@/features/profile/components/ActivityLogViewer';

type Tab = 'posts' | 'about' | 'friends' | 'photos' | 'videos' | 'activity';

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [activeTab, setActiveTab] = useState<Tab>('posts');

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['user-profile', username],
    queryFn: () => apiClient.get(`/users/${username}`).then((r) => r.data),
    enabled: !!username,
  });

  const profile = (profileData as any)?.data;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-64 rounded-xl bg-white animate-pulse" />
        <div className="h-96 rounded-xl bg-white animate-pulse" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-10 text-gray-500">المستخدم غير موجود</div>;
  }

  return (
    <div className="space-y-4">
      <ProfileHeader profile={profile} onEdit={() => {}} />
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="min-h-[400px]">
        {activeTab === 'posts' && <PostsTab userId={profile.userId} />}
        {activeTab === 'about' && <AboutTab profile={profile} />}
        {activeTab === 'friends' && <FriendsTab userId={profile.userId} />}
        {activeTab === 'photos' && <PhotosTab userId={profile.userId} />}
        {activeTab === 'videos' && <VideosTab userId={profile.userId} />}
        {activeTab === 'activity' && <ActivityLogViewer userId={profile.userId} />}
      </div>
    </div>
  );
}

function PostsTab({ userId }: { userId: string }) {
  return (
    <div className="rounded-xl bg-white p-6">
      <p className="text-gray-500 text-center">جاري تحميل المنشورات...</p>
    </div>
  );
}

function AboutTab({ profile }: { profile: any }) {
  return (
    <div className="space-y-4">
      <ProfileSection title="Work" icon="💼">
        {profile.workEntries?.length > 0 ? (
          <div className="space-y-3">
            {profile.workEntries.map((work: any, i: number) => (
              <div key={i} className="rounded-lg bg-gray-50 p-3">
                <p className="font-semibold text-gray-800">{work.company}</p>
                <p className="text-sm text-gray-600">{work.position}</p>
                <p className="text-xs text-gray-400">
                  {work.startDate} - {work.isCurrent ? 'حتى الآن' : work.endDate}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">لم تتم إضافة معلومات العمل</p>
        )}
      </ProfileSection>

      <ProfileSection title="Education" icon="🎓">
        {profile.educationEntries?.length > 0 ? (
          <div className="space-y-3">
            {profile.educationEntries.map((edu: any, i: number) => (
              <div key={i} className="rounded-lg bg-gray-50 p-3">
                <p className="font-semibold text-gray-800">{edu.school}</p>
                <p className="text-sm text-gray-600">{edu.degree}</p>
                <p className="text-xs text-gray-400">
                  {edu.startYear} - {edu.endYear}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">لم تتم إضافة معلومات التعليم</p>
        )}
      </ProfileSection>

      <ProfileSection title="Basic Info" icon="ℹ️">
        <div className="grid grid-cols-2 gap-3">
          {profile.relationshipStatus && (
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-400">الحالة الاجتماعية</p>
              <p className="text-sm font-semibold text-gray-800">{profile.relationshipStatus}</p>
            </div>
          )}
          {profile.location && (
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-400">الموقع</p>
              <p className="text-sm font-semibold text-gray-800">{profile.location}</p>
            </div>
          )}
          {profile.website && (
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-400">الموقع الإلكتروني</p>
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:underline">
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
  const { data } = useQuery({
    queryKey: ['friends', userId],
    queryFn: () => apiClient.get(`/users/${userId}/friends`).then((r) => r.data),
    enabled: !!userId,
  });

  const friends = (data as any)?.data?.data || [];

  return (
    <div className="rounded-xl bg-white p-6">
      {friends.length === 0 ? (
        <p className="text-gray-400 text-center">لا توجد أصدقاء</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {friends.map((friend: any, i: number) => (
            <div key={i} className="rounded-lg bg-gray-50 p-3 text-center">
              <div className="h-16 w-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                {friend.avatarUrl ? (
                  <img src={friend.avatarUrl} alt="" className="h-full w-full object-cover rounded-full" />
                ) : (
                  <span className="text-xl font-bold text-primary">{friend.fullName?.charAt(0)}</span>
                )}
              </div>
              <p className="mt-2 font-semibold text-gray-800">{friend.fullName}</p>
              {friend.mutualFriends > 0 && (
                <p className="text-xs text-gray-400">{friend.mutualFriends} مشترك</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PhotosTab({ userId }: { userId: string }) {
  const { data } = useQuery({
    queryKey: ['photos', userId],
    queryFn: () => apiClient.get(`/users/${userId}/photos`).then((r) => r.data),
    enabled: !!userId,
  });

  const photos = (data as any)?.data?.data || [];

  return (
    <div className="rounded-xl bg-white p-6">
      {photos.length === 0 ? (
        <p className="text-gray-400 text-center">لا توجد صور</p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {photos.map((photo: any, i: number) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {photo.metadata?.url && (
                <img src={photo.metadata.url} alt="" className="w-full h-full object-cover" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VideosTab({ userId }: { userId: string }) {
  const { data } = useQuery({
    queryKey: ['videos', userId],
    queryFn: () => apiClient.get(`/users/${userId}/videos`).then((r) => r.data),
    enabled: !!userId,
  });

  const videos = (data as any)?.data?.data || [];

  return (
    <div className="rounded-xl bg-white p-6">
      {videos.length === 0 ? (
        <p className="text-gray-400 text-center">لا توجد فيديوهات</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {videos.map((video: any, i: number) => (
            <div key={i} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <p className="text-gray-500 text-center p-4">{video.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
