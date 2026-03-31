'use client';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ProfileHeader } from './ProfileHeader';
import { ProfileSection } from './ProfileSection';
import { ProfileEditForm } from './ProfileEditForm';

export const ProfileView = () => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => apiClient.get('/users/me').then((r) => r.data),
  });

  const profile = (data as any)?.data ?? null;
  const hasProfile = profile?.fullName;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-xl bg-white animate-pulse" />)}
      </div>
    );
  }

  if (!hasProfile || editing) {
    return (
      <ProfileEditForm
        initial={profile}
        onSaved={() => { qc.invalidateQueries({ queryKey: ['my-profile'] }); setEditing(false); }}
        onCancel={hasProfile ? () => setEditing(false) : undefined}
      />
    );
  }

  return (
    <div className="space-y-4">
      <ProfileHeader profile={profile} onEdit={() => setEditing(true)} />

      <ProfileSection title="المعلومات الأساسية" icon="👤">
        <Grid items={[
          ['العمر', profile.age ? `${profile.age} سنة` : '—'],
          ['الجنس', profile.gender === 'male' ? 'ذكر' : 'أنثى'],
          ['الدولة', profile.country || '—'],
          ['المدينة', profile.city || '—'],
          ['الحالة الاجتماعية', profile.socialStatus || '—'],
          ['عدد الأطفال', String(profile.childrenCount ?? 0)],
        ]} />
        {profile.bio && <p className="mt-3 text-sm text-gray-600 leading-relaxed border-t pt-3">{profile.bio}</p>}
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

      <ProfileSection title="تفضيلات الزواج" icon="💍">
        <Grid items={[
          ['الفئة العمرية المفضلة', profile.minAge && profile.maxAge ? `${profile.minAge} - ${profile.maxAge} سنة` : '—'],
          ['الدولة المفضلة', profile.preferredCountry || '—'],
          ['الانتقال للخارج', profile.relocateWilling === true ? 'نعم' : profile.relocateWilling === false ? 'لا' : '—'],
          ['رغبة في الإنجاب', profile.wantsChildren === true ? 'نعم' : profile.wantsChildren === false ? 'لا' : '—'],
        ]} />
      </ProfileSection>
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
