'use client';
import { X } from '@phosphor-icons/react';
import type { SearchFiltersState, TabType } from '../types';
import { COUNTRIES } from '@/lib/countries';

interface Props {
  filters: SearchFiltersState;
  onChange: (f: SearchFiltersState) => void;
  onReset: () => void;
  onSearch: () => void;
  // Each tab searches a different content type -- the People filter set
  // (sect/prayer level/education/...) was being reused everywhere, so
  // switching to Events/Communities/Pages/Posts showed irrelevant fields
  // that had no effect on those results (#352).
  activeTab: TabType;
}

const set = (filters: SearchFiltersState, onChange: Props['onChange']) =>
  (k: keyof SearchFiltersState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange({ ...filters, [k]: e.target.value });

const inputStyle = {
  background: 'var(--background)',
  border: '1px solid var(--border)',
  color: 'var(--foreground)',
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>
      {label}
    </label>
    {children}
  </div>
);

export const SearchFilters = ({ filters, onChange, onReset, onSearch, activeTab }: Props) => {
  const s = set(filters, onChange);

  // #24: reject negative ages on input; the 18 floor is enforced via min + backend.
  const setAge = (k: keyof SearchFiltersState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v !== '' && Number(v) < 0) return;
    onChange({ ...filters, [k]: v });
  };

  const inp = (k: keyof SearchFiltersState, label: string, ph = '') => (
    <Field label={label}>
      <input type="text" value={filters[k]} onChange={s(k)} placeholder={ph}
        className="w-full rounded-xl px-3 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        style={inputStyle} />
    </Field>
  );

  const dateInp = (k: keyof SearchFiltersState, label: string) => (
    <Field label={label}>
      <input type="date" value={filters[k]} onChange={s(k)}
        className="w-full rounded-xl px-3 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        style={inputStyle} />
    </Field>
  );

  const sel = (k: keyof SearchFiltersState, label: string, opts: [string, string][]) => (
    <Field label={label}>
      <select value={filters[k]} onChange={s(k)}
        className="w-full rounded-xl px-3 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 cursor-pointer appearance-none"
        style={inputStyle}>
        <option value="">الكل</option>
        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </Field>
  );

  const peopleFields = (
    <>
      {sel('gender', 'الجنس', [['male', 'ذكر'], ['female', 'أنثى']])}
      {/* Was free text -- matched profile.country only when both happened to
          be typed the same way (e.g. "مصر" vs "Egypt" never matched) (#345).
          A fixed list, shared with the profile-edit country field, keeps
          this searchable going forward. */}
      {sel('country', 'الدولة', COUNTRIES)}
      {inp('city', 'المدينة', 'القاهرة، الرياض...')}

      <Field label="الفئة العمرية">
        <div className="flex gap-1.5 items-center">
          <input type="number" min={18} value={filters.minAge} onChange={setAge('minAge')} placeholder="من"
            className="w-full rounded-xl px-2 py-2.5 text-sm text-center transition-all focus:outline-none focus:ring-2"
            style={inputStyle} />
          <span className="text-xs shrink-0" style={{ color: 'var(--muted-foreground)' }}>—</span>
          <input type="number" min={18} value={filters.maxAge} onChange={setAge('maxAge')} placeholder="إلى"
            className="w-full rounded-xl px-2 py-2.5 text-sm text-center transition-all focus:outline-none focus:ring-2"
            style={inputStyle} />
        </div>
      </Field>

      {sel('sect', 'المذهب', [['sunni', 'سني'], ['shia', 'شيعي'], ['other', 'أخرى']])}
      {sel('prayerLevel', 'مستوى الصلاة', [
        ['always', 'دائماً'], ['mostly', 'في الغالب'], ['sometimes', 'أحياناً'],
      ])}
      {sel('lifestyle', 'نمط الحياة', [
        ['conservative', 'محافظ'], ['moderate', 'معتدل'], ['open', 'منفتح'],
      ])}
      {sel('education', 'التعليم', [
        ['high_school', 'ثانوية'], ['diploma', 'دبلوم'], ['bachelor', 'بكالوريوس'],
        ['master', 'ماجستير'], ['phd', 'دكتوراه'],
      ])}
    </>
  );

  const groupsFields = (
    <>
      {inp('groupCategory', 'الفئة', 'رياضة، تعليم...')}
      {inp('groupLocation', 'الموقع', 'القاهرة، الرياض...')}
    </>
  );

  const pagesFields = (
    <>
      {inp('pageCategory', 'الفئة', 'أعمال، ترفيه...')}
    </>
  );

  const eventsFields = (
    <>
      {inp('eventLocation', 'الموقع', 'القاهرة، الرياض...')}
      {dateInp('eventDateFrom', 'من تاريخ')}
      {dateInp('eventDateTo', 'إلى تاريخ')}
    </>
  );

  const postsFields = (
    <>
      {/* No path in this app lets a user create a post whose postType actually
          becomes 'video' -- PostComposer never sends postType:'video' (only
          poll/link are set explicitly; a post with an attached video file
          still defaults to postType TEXT), so this option could never match
          anything in search results (#393). Video content is reachable via
          the separate Watch/Reels features instead. */}
      {sel('postType', 'نوع المنشور', [
        ['text', 'نصي'], ['image', 'صورة'],
      ])}
      {dateInp('postDateFrom', 'من تاريخ')}
      {dateInp('postDateTo', 'إلى تاريخ')}
    </>
  );

  const fieldsByTab: Record<typeof activeTab, React.ReactNode> = {
    people: peopleFields,
    groups: groupsFields,
    pages: pagesFields,
    events: eventsFields,
    posts: postsFields,
  };

  return (
    <div className="pt-3 mt-3 space-y-4" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {fieldsByTab[activeTab]}
      </div>

      <div className="flex gap-2 justify-end">
        <button onClick={onReset}
          className="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition-all hover:bg-[color-mix(in_srgb,var(--foreground)_4%,transparent)]"
          style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
          <X size={13} /> إعادة تعيين
        </button>
        <button onClick={onSearch}
          className="rounded-xl px-5 py-2 text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
          تطبيق الفلاتر
        </button>
      </div>
    </div>
  );
};
