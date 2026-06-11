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

interface Props {
  userId?: string;
}

export const ProfileView = ({ userId }: Props) => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('about');

  const { data, isLoading } = useQuery({
    queryKey: userId ? ['user-profile', userId] : ['my-profile'],
    queryFn: () =>
      userId
        ? apiClient.get(`/users/${userId}`).then((r) => r.data)
        : apiClient.get('/users/me').then((r) => r.data),
  });

  const profile = (data as any)?.data ?? null;
  const isSelf = !userId || profile?.isSelf === true;
  const hasProfile = !!profile?.fullName;
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
    mutationFn: () => profileApi.cancelFriendRequest(friendshipStatus.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['friendship-status', profileUserId] }),
  });

  const acceptRequest = useMutation({
    mutationFn: () => profileApi.acceptFriendRequest(friendshipStatus.id),
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
          ['الجنس', profile.gender === 'male' ? 'ذكر' : 'أنثى'],
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

  const tabContent: Record<Tab, React.ReactNode> = {
    about:    aboutContent,
    activity: profileUserId ? <ActivityLogViewer userId={profileUserId} /> : placeholder('النشاط'),
    posts:    placeholder('المنشورات'),
    friends:  placeholder('الأصدقاء'),
    photos:   placeholder('الصور'),
    videos:   placeholder('الفيديوهات'),
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
      {tabContent[activeTab]}
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
