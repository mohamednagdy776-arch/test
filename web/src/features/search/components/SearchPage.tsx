'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { SearchFilters } from './SearchFilters';
import { UserCard } from './UserCard';
import { UserProfileModal } from './UserProfileModal';
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

const TABS: { key: TabType; label: string }[] = [
  { key: 'people',  label: 'الأشخاص'   },
  { key: 'groups',  label: 'المجتمعات' },
  { key: 'pages',   label: 'الصفحات'   },
  { key: 'events',  label: 'الفعاليات' },
  { key: 'posts',   label: 'المنشورات' },
];

export const SearchPage = () => {
  const [query,          setQuery]          = useState('');
  const [activeTab,      setActiveTab]      = useState<TabType>('people');
  const [filters,        setFilters]        = useState<SearchFiltersState>(emptyFilters);
  const [applied,        setApplied]        = useState<SearchFiltersState>(emptyFilters);
  const [showAdvanced,   setShowAdvanced]   = useState(false);
  const [selectedUser,   setSelectedUser]   = useState<any>(null);
  const [results,        setResults]        = useState<any[]>([]);
  const [isLoading,      setIsLoading]      = useState(false);
  const [hasSearched,    setHasSearched]    = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions,setShowSuggestions]= useState(false);
  const [suggestions,    setSuggestions]    = useState<SuggestionItem[]>([]);
  const searchRef  = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSearchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setRecentSearches(getRecentSearches()); }, []);

  // Autocomplete suggestions (debounced 300ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(() => {
      searchApi.searchSuggestions(query).then(setSuggestions);
    }, 300);
  }, [query]);

  // Close suggestion dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Run the search — only called explicitly (Enter, button, suggestion click, tab change)
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
      if (tab === 'people') {
        Object.entries(appliedFilters).forEach(([k, v]) => {
          if (v) params[k as keyof SearchParams] = v as any;
        });
      }
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

  // Auto-search after 600ms of no typing (declared after runSearch so it is defined)
  useEffect(() => {
    if (autoSearchRef.current) clearTimeout(autoSearchRef.current);
    if (!query.trim()) return;
    autoSearchRef.current = setTimeout(() => {
      runSearch(query, activeTab, applied);
    }, 600);
    return () => { if (autoSearchRef.current) clearTimeout(autoSearchRef.current); };
  }, [query, activeTab, applied, runSearch]);

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

  const handleApplyFilters = () => {
    const next = { ...filters };
    setApplied(next);
    runSearch(query, activeTab, next);
  };

  const handleReset = () => { setFilters(emptyFilters); setApplied(emptyFilters); };

  const tabIcon: Record<TabType, string> = {
    people: '👤', groups: '👥', pages: '📄', events: '📅', posts: '📝',
  };

  return (
    <div className="space-y-5">
      {/* Search bar */}
      <div ref={searchRef} className="relative">
        <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => query.trim() && setShowSuggestions(true)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="ابحث بالاسم أو البلد أو المهنة أو المذهب..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-black focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors"
            >
              {isLoading ? '...' : 'بحث'}
            </button>
            <button
              onClick={() => setShowAdvanced(v => !v)}
              className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                showAdvanced ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              🔧 متقدم
            </button>
          </div>

          {showAdvanced && (
            <SearchFilters
              filters={filters}
              onChange={setFilters}
              onReset={handleReset}
              onSearch={handleApplyFilters}
            />
          )}
        </div>

        {/* Autocomplete dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 z-50 max-h-72 overflow-auto">
            {suggestions.map((s, i) => (
              <button
                key={`${s.type}-${s.id}-${i}`}
                onClick={() => { setQuery(s.name); setShowSuggestions(false); handleSearch(s.name); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-right"
              >
                <span className="text-lg">
                  {s.type === 'user' ? '👤' : s.type === 'group' ? '👥' : s.type === 'page' ? '📄' : '📅'}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{s.name}</div>
                  {s.subtext && <div className="text-xs text-gray-500">{s.subtext}</div>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-1 flex gap-1 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-emerald-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Empty / Recent searches state */}
      {!hasSearched && !isLoading && (
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">عمليات البحث الأخيرة</h3>
                <button onClick={() => { clearRecentSearches(); setRecentSearches([]); }} className="text-xs text-emerald-600 hover:underline">
                  مسح الكل
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map(r => (
                  <button
                    key={r}
                    onClick={() => { setQuery(r); handleSearch(r); }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200"
                  >
                    <span>🕐</span><span>{r}</span>
                    <span
                      role="button"
                      onClick={e => { e.stopPropagation(); removeRecentSearch(r); setRecentSearches(getRecentSearches()); }}
                      className="text-gray-400 hover:text-gray-600"
                    >×</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">عمليات البحث الشائعة</h3>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map(p => (
                <button key={p} onClick={() => { setQuery(p); handleSearch(p); }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full text-sm text-emerald-700 hover:bg-emerald-100">
                  <span>🔥</span><span>{p}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-52 rounded-xl bg-white animate-pulse" />)}
        </div>
      )}

      {/* No results */}
      {!isLoading && hasSearched && results.length === 0 && (
        <div className="rounded-xl bg-white p-12 text-center text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium text-gray-600">لا توجد نتائج</p>
          <p className="text-xs mt-1">جرب كلمات مختلفة أو عوامل تصفية أخرى</p>
        </div>
      )}

      {/* Results grid */}
      {!isLoading && results.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeTab === 'people' ? (
            results.map(u => (
              <UserCard key={u.id} user={u} onView={() => setSelectedUser(u)} />
            ))
          ) : (
            results.map((item: any) => (
              <div key={item.id} className="rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                    {tabIcon[activeTab]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {item.name || item.title || item.fullName}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {activeTab === 'groups' && item.memberCount ? `${item.memberCount} عضو` : ''}
                      {activeTab === 'pages'  && item.category    ? item.category              : ''}
                      {activeTab === 'events' && item.location    ? item.location               : ''}
                      {activeTab === 'posts'  && item.content     ? item.content.slice(0, 60)   : ''}
                    </p>
                  </div>
                </div>
                <button className="w-full mt-3 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  {activeTab === 'groups' ? 'انضم' : activeTab === 'pages' ? 'متابعة' : 'عرض'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {selectedUser && (
        <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
};
