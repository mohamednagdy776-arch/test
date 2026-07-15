'use client';
import { SearchPage as SearchPageContent } from '@/features/search/components/SearchPage';
import { useT } from '@/i18n/I18nProvider';

export default function Search() {
  const { t } = useT();
  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-soft p-5">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-xl shadow-lg shadow-black/10">
            🧭
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--primary)]">{t('nav.search')}</h1>
            <p className="text-xs text-[var(--muted-foreground)]">{t('search.subtitle')}</p>
          </div>
        </div>
      </div>
      <SearchPageContent />
    </div>
  );
}
