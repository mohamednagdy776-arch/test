'use client';
import type { SearchFiltersState } from './SearchPage';

interface Props {
  filters: SearchFiltersState;
  onChange: (f: SearchFiltersState) => void;
  onReset: () => void;
  onSearch: () => void;
}

const set = (filters: SearchFiltersState, onChange: Props['onChange']) =>
  (k: keyof SearchFiltersState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...filters, [k]: e.target.value });

export const SearchFilters = ({ filters, onChange, onReset, onSearch }: Props) => {
  const s = set(filters, onChange);

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-500">{label}</label>
      {children}
    </div>
  );

  const inp = (k: keyof SearchFiltersState, label: string, ph = '') => (
    <Field label={label}>
      <input type="text" value={filters[k]} onChange={s(k)} placeholder={ph}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
    </Field>
  );

  const sel = (k: keyof SearchFiltersState, label: string, opts: [string, string][]) => (
    <Field label={label}>
      <select value={filters[k]} onChange={s(k)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none">
        <option value="">الكل</option>
        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </Field>
  );

  return (
    <div className="border-t pt-3 space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {sel('gender', 'الجنس', [['male', 'ذكر'], ['female', 'أنثى']])}
        {inp('country', 'الدولة', 'مصر، السعودية...')}
        {inp('city', 'المدينة', 'القاهرة...')}

        <Field label="الفئة العمرية">
          <div className="flex gap-1 items-center">
            <input type="number" value={filters.minAge} onChange={s('minAge')} placeholder="من"
              className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm focus:border-primary focus:outline-none" />
            <span className="text-gray-400 text-xs shrink-0">—</span>
            <input type="number" value={filters.maxAge} onChange={s('maxAge')} placeholder="إلى"
              className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm focus:border-primary focus:outline-none" />
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

      <div className="flex gap-2 justify-end pt-1">
        <button onClick={onReset}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50">
          إعادة تعيين
        </button>
        <button onClick={onSearch}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          تطبيق الفلاتر
        </button>
      </div>
    </div>
  );
};
