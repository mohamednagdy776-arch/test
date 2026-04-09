'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface Props {
  initial: any;
  onSaved: () => void;
  onCancel?: () => void;
}

const empty = {
  fullName: '', age: 25, gender: 'male', country: '', city: '',
  socialStatus: '', childrenCount: 0, bio: '',
  website: '', relationshipStatus: '', location: '', workplace: '', introVisibility: 'public',
  education: '', jobTitle: '', financialLevel: '', culturalLevel: '', lifestyle: '',
  sect: '', prayerLevel: '', religiousCommitment: '',
  minAge: 20, maxAge: 40, preferredCountry: '', relocateWilling: false, wantsChildren: true,
  workEntries: [], educationEntries: [],
};

const tabs = ['الأساسية', 'التعليم والعمل', 'الدين', 'التفضيلات'];

export const ProfileEditForm = ({ initial, onSaved, onCancel }: Props) => {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({ ...empty, ...(initial ?? {}) });

  const save = useMutation({
    mutationFn: (p: typeof form) => apiClient.patch('/users/me', p).then((r) => r.data),
    onSuccess: onSaved,
  });

  const str = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f: typeof form) => ({ ...f, [k]: e.target.value }));
  const num = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f: typeof form) => ({ ...f, [k]: Number(e.target.value) }));
  const bool = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    setForm((f: typeof form) => ({ ...f, [k]: e.target.value === 'true' }));

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  );

  const inp = (k: keyof typeof form, label: string, type = 'text', ph = '') => (
    <Field label={label}>
      <input type={type} value={(form as any)[k] ?? ''} onChange={type === 'number' ? num(k) : str(k)} placeholder={ph}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
    </Field>
  );

  const sel = (k: keyof typeof form, label: string, opts: [string, string][]) => (
    <Field label={label}>
      <select value={(form as any)[k] ?? ''} onChange={str(k)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none">
        <option value="">اختر...</option>
        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </Field>
  );

  const boolSel = (k: keyof typeof form, label: string) => (
    <Field label={label}>
      <select value={String((form as any)[k])} onChange={bool(k)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none">
        <option value="true">نعم</option>
        <option value="false">لا</option>
      </select>
    </Field>
  );

  const tabContent = [
    // Tab 0 — Basic
    <div key="basic" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {inp('fullName', 'الاسم الكامل', 'text', 'أحمد محمد')}
      {inp('age', 'العمر', 'number', '25')}
      {sel('gender', 'الجنس', [['male', 'ذكر'], ['female', 'أنثى']])}
      {inp('country', 'الدولة', 'text', 'مصر')}
      {inp('city', 'المدينة', 'text', 'القاهرة')}
      {inp('location', 'الموقع (مدينة/دولة)', 'text', 'القاهرة، مصر')}
      {sel('socialStatus', 'الحالة الاجتماعية', [['single', 'أعزب'], ['divorced', 'مطلق'], ['widowed', 'أرمل']])}
      {sel('relationshipStatus', 'الحالة العاطفية', [
        ['single', 'عزباء'], ['in_relationship', 'في علاقة'], ['engaged', 'مخطوبة'], ['married', 'متزوجة'],
      ])}
      {inp('childrenCount', 'عدد الأطفال', 'number', '0')}
      {inp('workplace', 'مكان العمل', 'text', 'شركة تقنية')}
      {inp('website', 'الموقع الإلكتروني', 'url', 'https://example.com')}
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-gray-600">نبذة شخصية</label>
        <textarea value={form.bio} onChange={str('bio')} rows={3} maxLength={101} placeholder="اكتب نبذة مختصرة عن نفسك..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
        <p className="text-xs text-gray-400 mt-1">{form.bio?.length || 0}/101</p>
      </div>
    </div>,

    // Tab 1 — Education & Work
    <div key="work" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {sel('education', 'المستوى التعليمي', [
        ['high_school', 'ثانوية عامة'], ['diploma', 'دبلوم'], ['bachelor', 'بكالوريوس'],
        ['master', 'ماجستير'], ['phd', 'دكتوراه'],
      ])}
      {inp('jobTitle', 'المسمى الوظيفي', 'text', 'مهندس برمجيات')}
      {sel('financialLevel', 'المستوى المادي', [
        ['low', 'منخفض'], ['medium', 'متوسط'], ['high', 'مرتفع'], ['very_high', 'مرتفع جداً'],
      ])}
      {sel('culturalLevel', 'المستوى الثقافي', [
        ['low', 'منخفض'], ['medium', 'متوسط'], ['high', 'مرتفع'],
      ])}
      {sel('lifestyle', 'نمط الحياة', [
        ['conservative', 'محافظ'], ['moderate', 'معتدل'], ['open', 'منفتح'],
      ])}
    </div>,

    // Tab 2 — Religious
    <div key="religion" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {sel('sect', 'المذهب', [
        ['sunni', 'سني'], ['shia', 'شيعي'], ['other', 'أخرى'],
      ])}
      {sel('prayerLevel', 'مستوى الصلاة', [
        ['always', 'دائماً'], ['mostly', 'في الغالب'], ['sometimes', 'أحياناً'], ['rarely', 'نادراً'],
      ])}
      {sel('religiousCommitment', 'الالتزام الديني', [
        ['very_committed', 'ملتزم جداً'], ['committed', 'ملتزم'], ['moderate', 'معتدل'], ['low', 'منخفض'],
      ])}
    </div>,

    // Tab 3 — Preferences
    <div key="prefs" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {inp('minAge', 'الحد الأدنى للعمر', 'number', '20')}
      {inp('maxAge', 'الحد الأقصى للعمر', 'number', '40')}
      {inp('preferredCountry', 'الدولة المفضلة', 'text', 'مصر')}
      {boolSel('relocateWilling', 'الاستعداد للانتقال')}
      {boolSel('wantsChildren', 'الرغبة في الإنجاب')}
    </div>,
  ];

  return (
    <div className="rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">
          {initial?.fullName ? 'تعديل الملف الشخصي' : 'أكمل ملفك الشخصي'}
        </h2>
        {onCancel && (
          <button onClick={onCancel} className="text-sm text-gray-400 hover:text-gray-600">إلغاء</button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b overflow-x-auto">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`shrink-0 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === i ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); save.mutate(form); }} className="p-6">
        {save.isError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            فشل الحفظ، حاول مرة أخرى
          </div>
        )}

        {tabContent[tab]}

        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <div className="flex gap-2">
            {tab > 0 && (
              <button type="button" onClick={() => setTab(t => t - 1)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                ← السابق
              </button>
            )}
            {tab < tabs.length - 1 && (
              <button type="button" onClick={() => setTab(t => t + 1)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                التالي →
              </button>
            )}
          </div>
          <button type="submit" disabled={save.isPending}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            {save.isPending ? 'جاري الحفظ...' : 'حفظ الملف الشخصي'}
          </button>
        </div>
      </form>
    </div>
  );
};
