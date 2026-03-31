'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface ProfileData {
  fullName: string;
  age: number;
  gender: string;
  country: string;
  city: string;
  socialStatus: string;
  childrenCount: number;
}

const empty: ProfileData = {
  fullName: '', age: 25, gender: 'male', country: '', city: '', socialStatus: '', childrenCount: 0,
};

export const ProfileView = () => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProfileData>(empty);
  const [formReady, setFormReady] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => apiClient.get('/users/me').then((r) => r.data),
  });

  const save = useMutation({
    mutationFn: (p: ProfileData) => apiClient.patch('/users/me', p).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-profile'] }); setEditing(false); },
  });

  const set = (k: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }));

  if (isLoading) return <div className="h-48 rounded-xl bg-white animate-pulse" />;

  const profile = (data as any)?.data ?? null;
  const hasProfile = profile?.fullName;

  // Populate form once when profile loads
  if (hasProfile && !formReady) {
    setForm({ ...empty, ...profile });
    setFormReady(true);
  }

  const showForm = !hasProfile || editing;

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      {showForm ? (
        <>
          <h2 className="mb-5 text-lg font-bold text-gray-900">
            {hasProfile ? 'تعديل الملف الشخصي' : 'أكمل ملفك الشخصي'}
          </h2>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(form); }} className="space-y-4">
            {save.isError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                فشل الحفظ، حاول مرة أخرى
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {([
                ['fullName', 'الاسم الكامل', 'text', 'أحمد محمد'],
                ['age', 'العمر', 'number', '25'],
                ['country', 'الدولة', 'text', 'مصر'],
                ['city', 'المدينة', 'text', 'القاهرة'],
                ['socialStatus', 'الحالة الاجتماعية', 'text', 'أعزب'],
                ['childrenCount', 'عدد الأطفال', 'number', '0'],
              ] as const).map(([k, label, type, ph]) => (
                <div key={k}>
                  <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
                  <input type={type} value={(form as any)[k]} onChange={set(k)} placeholder={ph}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">الجنس</label>
                <select value={form.gender} onChange={set('gender')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none">
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={save.isPending}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                {save.isPending ? 'جاري الحفظ...' : 'حفظ'}
              </button>
              {hasProfile && (
                <button type="button" onClick={() => setEditing(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
                  إلغاء
                </button>
              )}
            </div>
          </form>
        </>
      ) : (
        <>
          <div className="mb-6 flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
              {profile.fullName?.charAt(0) ?? '?'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{profile.fullName}</h2>
              <p className="text-sm text-gray-500">
                {[profile.city, profile.country].filter(Boolean).join('، ')}
              </p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {([
              ['العمر', profile.age ? `${profile.age} سنة` : '—'],
              ['الجنس', profile.gender === 'male' ? 'ذكر' : 'أنثى'],
              ['الحالة الاجتماعية', profile.socialStatus || '—'],
              ['عدد الأطفال', String(profile.childrenCount ?? 0)],
            ] as const).map(([k, v]) => (
              <div key={k} className="rounded-lg bg-gray-50 p-3">
                <dt className="text-xs font-medium text-gray-500">{k}</dt>
                <dd className="mt-1 font-medium text-gray-900">{v}</dd>
              </div>
            ))}
          </dl>
          <button onClick={() => { setForm({ ...empty, ...profile }); setEditing(true); }}
            className="mt-4 w-full rounded-lg border border-primary py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white transition-colors">
            تعديل الملف الشخصي
          </button>
        </>
      )}
    </div>
  );
};
