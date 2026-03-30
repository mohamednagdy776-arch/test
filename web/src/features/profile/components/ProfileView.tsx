'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export const ProfileView = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => apiClient.get('/users/me').then((r) => r.data),
  });

  if (isLoading) return <div className="h-48 rounded-xl bg-white animate-pulse" />;
  if (isError) return <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">فشل تحميل الملف الشخصي</div>;

  const profile = data?.data;

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
          {profile?.fullName?.charAt(0) ?? '?'}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{profile?.fullName ?? '—'}</h2>
          <p className="text-sm text-gray-500">{profile?.city}, {profile?.country}</p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-4 text-sm">
        {[
          ['العمر', profile?.age ? `${profile.age} سنة` : '—'],
          ['الجنس', profile?.gender ?? '—'],
          ['الحالة الاجتماعية', profile?.socialStatus ?? '—'],
          ['عدد الأطفال', profile?.childrenCount ?? 0],
        ].map(([k, v]) => (
          <div key={String(k)} className="rounded-lg bg-gray-50 p-3">
            <dt className="text-xs font-medium text-gray-500">{k}</dt>
            <dd className="mt-1 font-medium text-gray-900">{v}</dd>
          </div>
        ))}
      </dl>
      <button className="mt-4 w-full rounded-lg border border-primary py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white transition-colors">
        تعديل الملف الشخصي
      </button>
    </div>
  );
};
