'use client';
import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { COUNTRIES } from '@/lib/countries';
import { useT } from '@/i18n/I18nProvider';

interface Props {
  initial: any;
  onSaved: () => void;
  onCancel?: () => void;
}

const empty = {
  fullName: '', age: 25, gender: '', country: '', city: '',
  socialStatus: '', childrenCount: 0, bio: '',
  website: '', relationshipStatus: '', location: '', workplace: '', introVisibility: 'public',
  education: '', jobTitle: '', financialLevel: '', culturalLevel: '', lifestyle: '',
  sect: '', prayerLevel: '', religiousCommitment: '',
  minAge: 20, maxAge: 40, preferredCountry: '', relocateWilling: false, wantsChildren: true,
  workEntries: [], educationEntries: [],
};

// Module-scope stable component — defining it inside render would remount
// inputs every keystroke and drop focus (H-08).
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">{label}</label>
    {children}
  </div>
);

export const ProfileEditForm = ({ initial, onSaved, onCancel }: Props) => {
  const { t } = useT();
  const tabs = [t('profileEdit.tab.basic'), t('profileEdit.tab.workEducation'), t('profileEdit.tab.religion'), t('profileEdit.tab.preferences')];
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({ ...empty, ...(initial ?? {}) });
  const [formError, setFormError] = useState('');

  // Warn before leaving with unsaved edits (browser refresh/close) (#458).
  const initialSnapshot = useRef(JSON.stringify({ ...empty, ...(initial ?? {}) }));
  const dirty = JSON.stringify(form) !== initialSnapshot.current;
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const save = useMutation({
    mutationFn: (p: typeof form) => apiClient.patch('/users/me', p).then((r) => r.data),
    onSuccess: onSaved,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    // Reject a whitespace-only name and trim before saving (#407).
    const fullName = (form.fullName ?? '').trim();
    if (form.fullName && !fullName) { setTab(0); setFormError(t('profileEdit.error.invalidName')); return; }
    if (!form.gender) { setTab(0); setFormError(t('profileEdit.error.genderRequired')); return; }
    if (!form.age || form.age < 18 || form.age > 99) { setTab(0); setFormError(t('profileEdit.error.invalidAge')); return; }
    // Children count cannot be negative — the backend @Min(0) would otherwise
    // reject with a generic 400 and no clear message (#44).
    if (form.childrenCount != null && form.childrenCount < 0) { setTab(0); setFormError(t('profileEdit.error.negativeChildren')); return; }
    if (form.minAge && form.maxAge && form.minAge > form.maxAge) {
      setTab(3); setFormError(t('profileEdit.error.minMaxAge')); return;
    }
    save.mutate({ ...form, fullName });
  };

  const str = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f: typeof form) => ({ ...f, [k]: e.target.value }));
  const num = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    // Empty input → null (not 0). Number('') === 0 would silently submit age 0 etc.
    setForm((f: typeof form) => ({ ...f, [k]: e.target.value === '' ? null : Number(e.target.value) }));
  const bool = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    setForm((f: typeof form) => ({ ...f, [k]: e.target.value === 'true' }));

  // No background class at all was applied to any of these controls -- they
  // rendered as native (opaque white) inputs while text-[var(--foreground)]
  // is light in Dark Mode, making everything unreadable there (#256).
  const inp = (k: keyof typeof form, label: string, type = 'text', ph = '', maxLength?: number, min?: number) => (
    <Field label={label}>
      <input type={type} value={(form as any)[k] ?? ''} onChange={type === 'number' ? num(k) : str(k)} placeholder={ph} maxLength={maxLength} min={min}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]/30" />
    </Field>
  );

  const sel = (k: keyof typeof form, label: string, opts: [string, string][]) => (
    <Field label={label}>
      <select value={(form as any)[k] ?? ''} onChange={str(k)}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--ring)] focus:outline-none">
        <option value="">{t('profileEdit.selectPlaceholder')}</option>
        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </Field>
  );

  const boolSel = (k: keyof typeof form, label: string) => (
    <Field label={label}>
      <select value={String((form as any)[k])} onChange={bool(k)}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--ring)] focus:outline-none">
        <option value="true">{t('profileView.yes')}</option>
        <option value="false">{t('profileView.no')}</option>
      </select>
    </Field>
  );

  const tabContent = [
    // Tab 0 — Basic
    <div key="basic" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {inp('fullName', t('profileEdit.field.fullName'), 'text', t('profileEdit.placeholder.fullName'), 100)}
      {inp('age', t('profileEdit.field.age'), 'number', '25')}
      {sel('gender', t('profileEdit.field.gender'), [['male', 'ذكر'], ['female', 'أنثى']])}
      {/* Was free text -- the same country could be stored as "مصر" in one
          profile and "Egypt" in another, so search could never reliably
          match across profiles (#345). A fixed list keeps new data
          consistent and searchable. */}
      {sel('country', t('profileEdit.field.country'), COUNTRIES)}
      {inp('city', t('profileEdit.field.city'), 'text', t('profileEdit.placeholder.city'))}
      {inp('location', t('profileEdit.field.location'), 'text', t('profileEdit.placeholder.location'))}
      {sel('socialStatus', t('profileEdit.field.socialStatus'), [['single', 'أعزب'], ['divorced', 'مطلق'], ['widowed', 'أرمل']])}
      {sel('relationshipStatus', t('profileEdit.field.relationshipStatus'), [
        ['single', form.gender === 'female' ? 'عزباء' : 'أعزب'],
        ['in_relationship', 'في علاقة'],
        ['engaged', form.gender === 'female' ? 'مخطوبة' : 'مخطوب'],
        ['married', form.gender === 'female' ? 'متزوجة' : 'متزوج'],
      ])}
      {inp('childrenCount', t('profileEdit.field.childrenCount'), 'number', '0', undefined, 0)}
      {inp('workplace', t('profileEdit.field.workplace'), 'text', t('profileEdit.placeholder.workplace'))}
      {inp('website', t('profileEdit.field.website'), 'url', 'https://example.com')}
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">{t('profileEdit.field.bio')}</label>
        <textarea value={form.bio} onChange={str('bio')} rows={3} maxLength={500} placeholder={t('profileEdit.placeholder.bio')}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]/30 resize-none" />
        <p className="text-xs text-[var(--muted-foreground)] mt-1">{form.bio?.length || 0}/500</p>
      </div>
    </div>,

    // Tab 1 — Education & Work
    <div key="work" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {sel('education', t('profileEdit.field.educationLevel'), [
        ['high_school', 'ثانوية عامة'], ['diploma', 'دبلوم'], ['bachelor', 'بكالوريوس'],
        ['master', 'ماجستير'], ['phd', 'دكتوراه'],
      ])}
      {inp('jobTitle', t('profileEdit.field.jobTitle'), 'text', t('profileEdit.placeholder.jobTitle'))}
      {sel('financialLevel', t('profileEdit.field.financialLevel'), [
        ['low', 'منخفض'], ['medium', 'متوسط'], ['high', 'مرتفع'], ['very_high', 'مرتفع جداً'],
      ])}
      {sel('culturalLevel', t('profileEdit.field.culturalLevel'), [
        ['low', 'منخفض'], ['medium', 'متوسط'], ['high', 'مرتفع'],
      ])}
      {sel('lifestyle', t('profileEdit.field.lifestyle'), [
        ['conservative', 'محافظ'], ['moderate', 'معتدل'], ['open', 'منفتح'],
      ])}
    </div>,

    // Tab 2 — Religious
    <div key="religion" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {sel('sect', t('profileEdit.field.sect'), [
        ['sunni', 'سني'], ['shia', 'شيعي'], ['other', 'أخرى'],
      ])}
      {sel('prayerLevel', t('profileEdit.field.prayerLevel'), [
        ['always', 'دائماً'], ['mostly', 'في الغالب'], ['sometimes', 'أحياناً'], ['rarely', 'نادراً'],
      ])}
      {sel('religiousCommitment', t('profileEdit.field.religiousCommitment'), [
        ['very_committed', 'ملتزم جداً'], ['committed', 'ملتزم'], ['moderate', 'معتدل'], ['low', 'منخفض'],
      ])}
    </div>,

    // Tab 3 — Preferences
    <div key="prefs" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {inp('minAge', t('profileEdit.field.minAge'), 'number', '20')}
      {inp('maxAge', t('profileEdit.field.maxAge'), 'number', '40')}
      {inp('preferredCountry', t('profileEdit.field.preferredCountry'), 'text', t('profileEdit.placeholder.preferredCountry'))}
      {boolSel('relocateWilling', t('profileEdit.field.relocateWilling'))}
      {boolSel('wantsChildren', t('profileEdit.field.wantsChildren'))}
    </div>,
  ];

  return (
    <div className="rounded-xl bg-[var(--card)] shadow-card-hover border border-[var(--border)]/60 overflow-hidden">
      <div className="border-b border-[var(--border)]/40 px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[var(--foreground)]">
          {initial?.fullName ? t('profileEdit.title.edit') : t('profileEdit.title.complete')}
        </h2>
        {onCancel && (
          <button onClick={onCancel} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--muted-foreground)]">{t('profile.cancel')}</button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b overflow-x-auto">
        {tabs.map((tabLabel, i) => (
          <button key={tabLabel} onClick={() => setTab(i)}
            className={`shrink-0 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === i ? 'border-[var(--accent)] text-[var(--foreground)]' : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}>
            {tabLabel}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {(save.isError || formError) && (
          <div className="mb-4 rounded-lg bg-[var(--destructive)]/10 border border-[var(--destructive)]/30 px-4 py-3 text-sm text-[var(--destructive)]">
            {formError || t('profileEdit.error.saveFailed')}
          </div>
        )}

        {tabContent[tab]}

        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <div className="flex gap-2">
            {tab > 0 && (
              <button type="button" onClick={() => setTab(v => v - 1)}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)]">
                → {t('profileView.pagination.prev')}
              </button>
            )}
            {tab < tabs.length - 1 && (
              <button type="button" onClick={() => setTab(v => v + 1)}
                className="rounded-lg bg-[var(--muted)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]">
                ← {t('profileView.pagination.next')}
              </button>
            )}
          </div>
          <button type="submit" disabled={save.isPending}
            className="rounded-lg bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-6 py-2 text-sm font-semibold text-[var(--card)] hover:shadow-glow disabled:opacity-50">
            {save.isPending ? t('post.edit.saving') : t('profileEdit.saveButton')}
          </button>
        </div>
      </form>
    </div>
  );
};
