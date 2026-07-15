'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { resolveMediaUrl } from '@/lib/media';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { SearchFilters } from './SearchFilters';
import { UserCard } from './UserCard';
import { UserProfileModal } from './UserProfileModal';
import { savedSearchesApi } from '../savedSearches';
import {
  searchApi,
  getRecentSearches,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
  POPULAR_SEARCHES,
  type SearchParams,
  type SuggestionItem,
} from '../api';
import { type SearchFiltersState, type TabType, emptyFilters } from '../types';
import { useT } from '@/i18n/I18nProvider';
import {
  MagnifyingGlass, SlidersHorizontal, X, Clock, Fire,
  Users, Newspaper, CalendarBlank, FileText, User, ArrowLeft,
} from '@phosphor-icons/react';


const TABS: { key: TabType; label: string; icon: typeof User }[] = [
  { key: 'people',  label: 'الأشخاص',   icon: User },
  { key: 'groups',  label: 'المجتمعات', icon: Users },
  { key: 'pages',   label: 'الصفحات',   icon: Newspaper },
  { key: 'events',  label: 'الفعاليات', icon: CalendarBlank },
  { key: 'posts',   label: 'المنشورات', icon: FileText },
];

const POPULAR_ARABIC = ['مصر', 'السعودية', 'طبيب', 'مهندس', 'لندن', 'محافظ', 'معتدل'];

// ── Rich result cards for non-people types ───────────────────────────────────

function GroupResultCard({ item }: { item: any }) {
  const router = useRouter();
  const coverSrc = item.coverPhoto
    ? (resolveMediaUrl(item.coverPhoto))
    : null;
  const initial = (item.name || 'م').charAt(0);
  const count = item.memberCount ?? item.membersCount ?? 0;

  return (
    <div className="rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, var(--secondary), var(--primary))' }} />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0">
            {coverSrc ? (
              <Image src={coverSrc} alt={item.name} width={48} height={48} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white"
                style={{ background: 'linear-gradient(135deg, var(--secondary), var(--primary))' }}>
                {initial}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold truncate" style={{ color: 'var(--foreground)' }}>{item.name}</h3>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {count > 0 ? `${count.toLocaleString('ar-SA')} عضو` : 'مجتمع جديد'}
              {item.category ? ` · ${item.category}` : ''}
            </p>
          </div>
        </div>
        {item.description && (
          <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: 'var(--muted-foreground)' }}>
            {item.description}
          </p>
        )}
        <button onClick={() => router.push(`/groups/${item.id}`)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
          style={{ background: 'linear-gradient(135deg, var(--secondary), var(--primary))' }}>
          انضم إلى المجتمع
        </button>
      </div>
    </div>
  );
}

function PageResultCard({ item }: { item: any }) {
  const router = useRouter();
  const coverSrc = item.coverPhoto
    ? (resolveMediaUrl(item.coverPhoto))
    : null;
  const initial = (item.name || 'ص').charAt(0);
  const followers = item.followersCount ?? item.followers ?? 0;

  return (
    <div className="rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, var(--accent), var(--primary))' }} />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0">
            {coverSrc ? (
              <Image src={coverSrc} alt={item.name} width={48} height={48} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent), #c8952e)' }}>
                {initial}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold truncate" style={{ color: 'var(--foreground)' }}>{item.name}</h3>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {followers > 0 ? `${followers.toLocaleString('ar-SA')} متابع` : ''}
              {item.category ? `${followers > 0 ? ' · ' : ''}${item.category}` : ''}
            </p>
          </div>
        </div>
        {item.description && (
          <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: 'var(--muted-foreground)' }}>
            {item.description}
          </p>
        )}
        <button onClick={() => router.push(`/pages/${item.id}`)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-95"
          style={{ background: 'color-mix(in srgb, var(--accent) 12%, var(--muted))', color: 'var(--accent)' }}>
          متابعة الصفحة
        </button>
      </div>
    </div>
  );
}

function EventResultCard({ item }: { item: any }) {
  const { t } = useT();
  const router = useRouter();
  const date = item.startDate ? new Date(item.startDate) : null;
  const dayNum = date?.getDate();
  const monthName = date?.toLocaleDateString('ar-SA', { month: 'short' });

  return (
    <div className="rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #d97706, var(--accent))' }} />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          {date ? (
            <div className="w-12 h-12 rounded-2xl shrink-0 flex flex-col items-center justify-center"
              style={{ background: 'color-mix(in srgb, var(--accent) 15%, var(--muted))' }}>
              <span className="text-sm font-extrabold leading-none" style={{ color: 'var(--accent)' }}>{dayNum}</span>
              <span className="text-[9px] font-medium mt-0.5" style={{ color: 'var(--accent)' }}>{monthName}</span>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0"
              style={{ background: 'color-mix(in srgb, var(--accent) 10%, var(--muted))' }}>
              📅
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold truncate" style={{ color: 'var(--foreground)' }}>{item.title || item.name}</h3>
            <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
              {item.location || item.type || t('search.results.eventFallback')}
            </p>
          </div>
        </div>
        {item.description && (
          <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: 'var(--muted-foreground)' }}>
            {item.description}
          </p>
        )}
        <button onClick={() => router.push(`/events/${item.id}`)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 text-white"
          style={{ background: 'linear-gradient(135deg, #d97706, var(--accent))' }}>
          {t('search.results.viewEvent')}
        </button>
      </div>
    </div>
  );
}

function PostResultCard({ item }: { item: any }) {
  const { t } = useT();
  const router = useRouter();
  const authorName = item.author?.fullName || item.author?.username || t('privacy.photoRequests.defaultUser');
  const avatarSrc = item.author?.avatar
    ? (resolveMediaUrl(item.author.avatar))
    : null;
  const reactions = (item.likesCount ?? 0) + (item.commentsCount ?? 0);

  return (
    <div className="rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 cursor-pointer group"
      onClick={() => item.id && router.push(`/posts/${item.id}`)}
      style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }} />
      <div className="p-5">
        <div className="flex items-center gap-2.5 mb-3">
          {avatarSrc ? (
            <Image src={avatarSrc} alt={authorName} width={36} height={36}
              className="rounded-xl object-cover shrink-0" style={{ width: 36, height: 36 }} />
          ) : (
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
              {authorName.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{authorName}</p>
            {item.createdAt && (
              <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                {new Date(item.createdAt).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })}
              </p>
            )}
          </div>
        </div>
        <p className="text-sm leading-relaxed line-clamp-3 mb-3" style={{ color: 'var(--foreground)' }}>
          {item.content || item.title || t('search.results.postFallback')}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {reactions > 0 ? t('search.results.reactionCount', { count: reactions.toLocaleString('ar-SA') }) : ''}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold group-hover:gap-1.5 transition-all"
            style={{ color: 'var(--primary)' }}>
            {t('search.results.viewPost')} <ArrowLeft size={12} />
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main SearchPage component ─────────────────────────────────────────────────

export const SearchPage = () => {
  const [query,           setQuery]           = useState('');
  const [activeTab,       setActiveTab]       = useState<TabType>('people');
  const [filters,         setFilters]         = useState<SearchFiltersState>(emptyFilters);
  const [applied,         setApplied]         = useState<SearchFiltersState>(emptyFilters);
  const [showAdvanced,    setShowAdvanced]    = useState(false);
  const [selectedUser,    setSelectedUser]    = useState<any>(null);
  const [results,         setResults]         = useState<any[]>([]);
  const [isLoading,       setIsLoading]       = useState(false);
  const [hasSearched,     setHasSearched]     = useState(false);
  const [recentSearches,  setRecentSearches]  = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions,     setSuggestions]     = useState<SuggestionItem[]>([]);
  const searchRef   = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoRef     = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setRecentSearches(getRecentSearches()); }, []);

  // The dropdown always showed every suggestion type (people/groups/pages/
  // events) mixed together no matter which category tab was active -- e.g.
  // switching to "Events" still surfaced person suggestions first (#353).
  // Posts have no suggestion type of their own, so that tab shows none.
  const suggestionTypeForTab: Record<TabType, SuggestionItem['type'] | null> = {
    people: 'user',
    groups: 'group',
    pages: 'page',
    events: 'event',
    posts: null,
  };
  const tabFilteredSuggestions = suggestions.filter((s) => s.type === suggestionTypeForTab[activeTab]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(() => {
      searchApi.searchSuggestions(query).then(setSuggestions);
    }, 300);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const runSearch = useCallback(async (q: string, tab: TabType, appliedFilters: SearchFiltersState) => {
    setIsLoading(true);
    setHasSearched(true);
    setResults([]);
    try {
      const params: SearchParams = {
        q: q.trim() || undefined,
        type: tab === 'people' ? 'people' : tab,
        limit: 20,
      };
      // Every tab now has its own dedicated filter fields (#352) -- applying
      // was previously hardcoded to the People tab only, so switching to
      // Events/Communities/Pages/Posts always searched unfiltered.
      Object.entries(appliedFilters).forEach(([k, v]) => {
        if (v) params[k as keyof SearchParams] = v as any;
      });
      const data = await searchApi.searchAll(params);
      const items =
        tab === 'people'  ? (data.users  ?? []) :
        tab === 'groups'  ? (data.groups ?? []) :
        tab === 'pages'   ? (data.pages  ?? []) :
        tab === 'events'  ? (data.events ?? []) :
                            (data.posts  ?? []);
      setResults(items);
    } catch (e) {
      console.error('Search failed:', e);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoRef.current) clearTimeout(autoRef.current);
    if (!query.trim()) return;
    autoRef.current = setTimeout(() => {
      runSearch(query, activeTab, applied);
    }, 600);
    return () => { if (autoRef.current) clearTimeout(autoRef.current); };
    // #25: tab switches are searched explicitly in handleTabChange, so activeTab
    // is intentionally excluded here — including it fired a duplicate request on
    // every tab switch (effect re-run + handleTabChange both calling runSearch).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, applied, runSearch]);

  const handleSearch = (searchQuery?: string) => {
    const q = (searchQuery ?? query).trim();
    if (!q && activeTab === 'people') return;
    if (q) { addRecentSearch(q); setRecentSearches(getRecentSearches()); }
    setShowSuggestions(false);
    runSearch(q, activeTab, applied);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setResults([]);
    setHasSearched(false);
    if (query.trim() || tab !== 'people') runSearch(query, tab, applied);
  };

  const suggestionIcon: Record<string, string> = {
    user: '👤', group: '👥', page: '📄', event: '📅',
  };

  return (
    <div className="space-y-5">
      {/* ── Search bar ────────────────────────────────────────────── */}
      <div ref={searchRef} className="relative">
        <div className="rounded-2xl p-4 space-y-3"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MagnifyingGlass size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--muted-foreground)' }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => query.trim() && setShowSuggestions(true)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="ابحث بالاسم أو البلد أو المهنة أو المذهب..."
                aria-label="حقل البحث"
                className="w-full pr-10 pl-3 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              />
              {query && (
                <button onClick={() => { setQuery(''); setResults([]); setHasSearched(false); setSuggestions([]); inputRef.current?.focus(); }}
                  aria-label="مسح البحث"
                  className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--muted-foreground)' }}>
                  <X size={14} />
                </button>
              )}
            </div>

            <button onClick={() => handleSearch()} disabled={isLoading}
              className="shrink-0 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
              {isLoading ? '...' : 'بحث'}
            </button>

            <button onClick={() => { setShowAdvanced((v) => !v); setShowSuggestions(false); }}
              aria-label="الفلاتر المتقدمة"
              className="shrink-0 flex items-center gap-1.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all"
              style={showAdvanced
                ? { background: 'color-mix(in srgb, var(--primary) 12%, var(--muted))', color: 'var(--primary)', border: '1px solid color-mix(in srgb, var(--primary) 25%, var(--border))' }
                : { background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
              <SlidersHorizontal size={15} />
              <span className="hidden sm:inline">متقدم</span>
            </button>
          </div>

          {showAdvanced && (
            <SearchFilters
              filters={filters}
              onChange={setFilters}
              onReset={() => { setFilters(emptyFilters); setApplied(emptyFilters); }}
              onSearch={() => { setApplied({ ...filters }); runSearch(query, activeTab, filters); setShowSuggestions(false); }}
              activeTab={activeTab}
            />
          )}

          {/* Saved searches (#757) */}
          <SavedSearchesStrip
            query={query}
            filters={applied}
            onApply={(s) => {
              setQuery(s.query ?? '');
              setFilters(s.filters ?? emptyFilters);
              setApplied(s.filters ?? emptyFilters);
              runSearch(s.query ?? '', activeTab, s.filters ?? emptyFilters);
            }}
          />
        </div>

        {/* Autocomplete dropdown */}
        {showSuggestions && tabFilteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl shadow-xl overflow-hidden z-50"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            {tabFilteredSuggestions.map((s, i) => (
              <button key={`${s.type}-${s.id}-${i}`}
                onClick={() => { setQuery(s.name); setShowSuggestions(false); handleSearch(s.name); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-right transition-colors hover:bg-[color-mix(in_srgb,var(--primary)_5%,var(--muted))]">
                <span className="text-base shrink-0 w-6 text-center">{suggestionIcon[s.type] ?? '🔍'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{s.name}</p>
                  {s.subtext && <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{s.subtext}</p>}
                </div>
                <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                  {s.type === 'user' ? 'شخص' : s.type === 'group' ? 'مجتمع' : s.type === 'page' ? 'صفحة' : 'فعالية'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-xl p-1 overflow-x-auto"
        style={{ background: 'var(--muted)' }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => handleTabChange(tab.key)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all active:scale-95"
              style={isActive
                ? { background: 'var(--card)', color: 'var(--primary)', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }
                : { color: 'var(--muted-foreground)' }}>
              <tab.icon size={13} weight={isActive ? 'fill' : 'regular'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Discovery state ───────────────────────────────────────── */}
      {!hasSearched && !isLoading && (
        <div className="rounded-2xl p-5 space-y-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>

          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock size={14} style={{ color: 'var(--muted-foreground)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>عمليات بحث سابقة</h3>
                </div>
                <button onClick={() => { clearRecentSearches(); setRecentSearches([]); }}
                  className="text-xs font-semibold hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--accent)' }}>
                  مسح الكل
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((r) => (
                  <button key={r}
                    onClick={() => { setQuery(r); handleSearch(r); }}
                    className="group flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm transition-all hover:bg-[color-mix(in_srgb,var(--primary)_8%,var(--muted))]"
                    style={{ background: 'var(--muted)', color: 'var(--foreground)' }}>
                    <Clock size={11} style={{ color: 'var(--muted-foreground)' }} />
                    <span>{r}</span>
                    <span role="button" aria-label="حذف"
                      onClick={(e) => { e.stopPropagation(); removeRecentSearch(r); setRecentSearches(getRecentSearches()); }}
                      className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
                      style={{ color: 'var(--muted-foreground)' }}>
                      <X size={10} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Fire size={14} style={{ color: 'var(--accent)' }} />
              <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>البحث الشائع</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {POPULAR_ARABIC.map((p) => (
                <button key={p} onClick={() => { setQuery(p); handleSearch(p); }}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'color-mix(in srgb, var(--accent) 10%, var(--muted))', color: 'var(--accent)' }}>
                  <Fire size={11} />
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Loading skeleton ──────────────────────────────────────── */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 rounded-2xl animate-pulse" style={{ background: 'var(--muted)' }} />
          ))}
        </div>
      )}

      {/* ── No results ────────────────────────────────────────────── */}
      {!isLoading && hasSearched && results.length === 0 && (
        <div className="rounded-2xl p-12 text-center"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'color-mix(in srgb, var(--primary) 10%, var(--muted))' }}>
            <MagnifyingGlass size={30} weight="light" style={{ color: 'var(--primary)', opacity: 0.5 }} />
          </div>
          <p className="font-bold" style={{ color: 'var(--foreground)' }}>لا توجد نتائج</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
            جرّب كلمات مختلفة أو غيّر الفلاتر
          </p>
        </div>
      )}

      {/* ── Results grid ──────────────────────────────────────────── */}
      {!isLoading && results.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {activeTab === 'people' && results.map((u) => (
            <UserCard key={u.id} user={u} onView={() => setSelectedUser(u)} />
          ))}
          {activeTab === 'groups' && results.map((item: any) => (
            <GroupResultCard key={item.id} item={item} />
          ))}
          {activeTab === 'pages' && results.map((item: any) => (
            <PageResultCard key={item.id} item={item} />
          ))}
          {activeTab === 'events' && results.map((item: any) => (
            <EventResultCard key={item.id} item={item} />
          ))}
          {activeTab === 'posts' && results.map((item: any) => (
            <PostResultCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {selectedUser && (
        <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
};

// [Body_Sadek] #757 — saved searches strip: save the current query+filters and
// re-run saved ones with one tap.
function SavedSearchesStrip({ query, filters, onApply }: {
  query: string;
  filters: any;
  onApply: (s: { query?: string; filters?: any }) => void;
}) {
  const [saved, setSaved] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    savedSearchesApi.list().then((r) => setSaved(r?.data ?? [])).catch(() => undefined);
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const name = (query || '').trim() || 'بحث محفوظ';
    setBusy(true);
    try {
      await savedSearchesApi.create(name, { query, criteria: filters });
      load();
    } finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    await savedSearchesApi.remove(id).catch(() => undefined);
    load();
  };

  const canSave = !!(query?.trim()) && saved.length < 20;

  return (
    <div className="mt-3 flex items-center gap-2 flex-wrap">
      {canSave && (
        <button
          onClick={save}
          disabled={busy}
          className="rounded-full px-3 py-1.5 text-xs font-semibold border border-[var(--border)] text-[var(--primary)] hover:bg-[var(--muted)] transition-colors disabled:opacity-50"
        >
          ★ احفظ هذا البحث
        </button>
      )}
      {saved.map((s) => (
        <span
          key={s.id}
          className="group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
        >
          <button onClick={() => onApply({ query: s.filters?.query, filters: s.filters?.criteria })} className="hover:text-[var(--primary)] transition-colors">
            {s.name}
          </button>
          <button onClick={() => remove(s.id)} aria-label="حذف البحث المحفوظ" className="text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors">✕</button>
        </span>
      ))}
    </div>
  );
}
