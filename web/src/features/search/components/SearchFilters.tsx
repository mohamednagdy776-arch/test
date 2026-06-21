'use client';
import { X } from '@phosphor-icons/react';
import type { SearchFiltersState } from '../types';

interface Props {
  filters: SearchFiltersState;
  onChange: (f: SearchFiltersState) => void;
  onReset: () => void;
  onSearch: () => void;
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

export const SearchFilters = ({ filters, onChange, onReset, onSearch }: Props) => {
  const s = set(filters, onChange);

  const inp = (k: keyof SearchFiltersState, label: string, ph = '') => (
    <Field label={label}>
      <input type="text" value={filters[k]} onChange={s(k)} placeholder={ph}
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

  return (
    <div className="pt-3 mt-3 space-y-4" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {sel('gender', 'الجنس', [['male', 'ذكر'], ['female', 'أنثى']])}
        {inp('country', 'الدولة', 'مصر، السعودية...')}
        {inp('city', 'المدينة', 'القاهرة، الرياض...')}

        <Field label="الفئة العمرية">
          <div className="flex gap-1.5 items-center">
            <input type="number" value={filters.minAge} onChange={s('minAge')} placeholder="من"
              className="w-full rounded-xl px-2 py-2.5 text-sm text-center transition-all focus:outline-none focus:ring-2"
              style={inputStyle} />
            <span className="text-xs shrink-0" style={{ color: 'var(--muted-foreground)' }}>—</span>
            <input type="number" value={filters.maxAge} onChange={s('maxAge')} placeholder="إلى"
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
