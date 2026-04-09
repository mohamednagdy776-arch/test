'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
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
  type SearchResult,
} from '../api';
import { type SearchFiltersState, type SearchType, type TabType, emptyFilters } from '../types';

const TABS: { key: TabType; label: string }[] = [
  { key: 'people', label: 'الأشخاص' },
  { key: 'groups', label: 'المجتمعات' },
  { key: 'pages', label: 'الصفحات' },
  { key: 'events', label: 'الفعاليات' },
  { key: 'posts', label: 'المنشورات' },
];

const TYPE_OPTIONS: { value: SearchType; label: string }[] = [
  { value: 'all', label: 'الكل' },
  { value: 'people', label: 'أشخاص' },
  { value: 'groups', label: 'مجتمعات' },
  { value: 'pages', label: 'صفحات' },
  { value: 'events', label: 'فعاليات' },
  { value: 'posts', label: 'منشورات' },
];

interface ResultsState {
  [key: string]: any[];
}

export const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [activeTab, setActiveTab] = useState<TabType>('people');
  const [filters, setFilters] = useState<SearchFiltersState>(emptyFilters);
  const [applied, setApplied] = useState<SearchFiltersState>(emptyFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [results, setResults] = useState<ResultsState>({});
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions([]);
      return;
    }
    searchApi.searchSuggestions(debouncedQuery).then(setSuggestions);
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = useCallback(async (reset = true) => {
    const currentCursor = reset ? undefined : cursor;
    const params: SearchParams = {
      q: query.trim() || undefined,
      type: activeTab === 'people' ? 'people' : activeTab,
      cursor: currentCursor,
      limit: 12,
    };
    if (activeTab === 'people') {
      Object.entries(applied).forEach(([k, v]) => { if (v) params[k as keyof SearchParams] = v; });
    }

    const data = await searchApi.searchAll(params);

    const newResults = data.users || data.groups || data.pages || data.events || data.posts || [];

    if (reset) {
      setResults({ [activeTab]: newResults });
    } else {
      setResults((prev) => ({
        ...prev,
        [activeTab]: [...(prev[activeTab] || []), ...newResults],
      }));
    }

    setCursor(data.nextCursor);
    setHasMore(!!data.nextCursor);
  }, [query, activeTab, applied, cursor]);

  const { isLoading, isFetching } = useQuery({
    queryKey: ['search', query, activeTab, applied, cursor],
    queryFn: () => performSearch(false),
    enabled: !!query.trim() || activeTab !== 'people',
  });

  const handleSearch = (searchQuery?: string) => {
    const q = searchQuery ?? query;
    if (q.trim()) {
      addRecentSearch(q.trim());
      setRecentSearches(getRecentSearches());
      setCursor(undefined);
      setResults({});
      performSearch(true).then(() => {
        if (searchQuery) setQuery(searchQuery);
      });
    }
  };

  const handleSuggestionClick = (s: SuggestionItem) => {
    setQuery(s.name);
    setShowSuggestions(false);
    handleSearch(s.name);
  };

  const handleRecentClick = (q: string) => {
    setQuery(q);
    handleSearch(q);
  };

  const handleLoadMore = () => {
    if (!isFetching && hasMore) {
      performSearch(false);
    }
  };

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMore && !isFetching) handleLoadMore(); },
      { threshold: 0.1 }
    );
    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, isFetching]);

  const handleReset = () => { setFilters(emptyFilters); setApplied(emptyFilters); };

  const currentResults = (results[activeTab] || []) as any[];

  const renderSuggestionIcon = (type: string) => {
    switch (type) {
      case 'user': return '👤';
      case 'group': return '👥';
      case 'page': return '📄';
      case 'event': return '📅';
      default: return '🔍';
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">البحث</h1>
      </div>

      <div ref={searchRef} className="relative">
        <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="ابحث في المجتمع..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button onClick={() => handleSearch()}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              بحث
            </button>
            <select
              value={searchType}
              onChange={(e) => { setSearchType(e.target.value as SearchType); setActiveTab(e.target.value === 'all' ? 'people' : e.target.value as TabType); }}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button onClick={() => setShowAdvanced((v) => !v)}
              className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${showAdvanced ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              🔧 متقدم
            </button>
          </div>

          {showAdvanced && (
            <SearchFilters filters={filters} onChange={setFilters} onReset={handleReset} onSearch={() => { setApplied({ ...filters }); setCursor(undefined); setResults({}); performSearch(true); }} />
          )}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 z-50 max-h-72 overflow-auto">
            {suggestions.map((s, i) => (
              <button
                key={`${s.type}-${s.id}-${i}`}
                onClick={() => handleSuggestionClick(s)}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-right"
              >
                <span className="text-lg">{renderSuggestionIcon(s.type)}</span>
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
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setCursor(undefined); setResults({}); }}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.key ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Empty state / Recent searches */}
      {!query.trim() && isLoading === false && currentResults.length === 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">عمليات البحث الأخيرة</h3>
                <button onClick={() => { clearRecentSearches(); setRecentSearches([]); }} className="text-xs text-primary hover:underline">مسح الكل</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRecentClick(r)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200"
                  >
                    <span>🕐</span>
                    <span>{r}</span>
                    <button onClick={(e) => { e.stopPropagation(); removeRecentSearch(r); setRecentSearches(getRecentSearches()); }} className="text-gray-400 hover:text-gray-600">×</button>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">عمليات البحث الشائعة</h3>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((p) => (
                <button
                  key={p}
                  onClick={() => handleRecentClick(p)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm text-primary hover:bg-primary/20"
                >
                  <span>🔥</span>
                  <span>{p}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="h-52 rounded-xl bg-white animate-pulse" />)}
        </div>
      ) : query.trim() && currentResults.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">لا توجد نتائج</p>
          <p className="text-xs mt-1">جرب كلمات مختلفة أو عوامل تصفية أخرى</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeTab === 'people' ? (
              currentResults.map((u) => (
                <UserCard key={u.id || u.userId} user={u} onView={() => setSelectedUser(u)} />
              ))
            ) : (
              currentResults.map((item: any) => (
                <div key={item.id} className="rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {item.avatarUrl || item.avatar || item.coverUrl ? (
                        <img src={item.avatarUrl || item.avatar || item.coverUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xl">{
                          activeTab === 'groups' ? '👥' : activeTab === 'pages' ? '📄' : activeTab === 'events' ? '📅' : '📝'
                        }</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{item.name || item.title || item.fullName}</h3>
                      <p className="text-xs text-gray-500 truncate">
                        {activeTab === 'groups' && item.memberCount ? `${item.memberCount} عضو` : ''}
                        {activeTab === 'pages' && item.category ? item.category : ''}
                        {activeTab === 'events' && item.location ? item.location : ''}
                        {activeTab === 'posts' && item.content ? item.content.slice(0, 50) + '...' : ''}
                      </p>
                    </div>
                  </div>
                  {activeTab !== 'posts' && (
                    <button className="w-full mt-3 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      {String(activeTab) === 'people' ? 'عرض الملف' : String(activeTab) === 'groups' ? 'انضم' : String(activeTab) === 'pages' ? 'متابعة' : 'عرض'}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Infinite scroll trigger */}
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-4">
              {isFetching ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">جاري التحميل...</span>
                </div>
              ) : (
                <button onClick={handleLoadMore} className="text-sm text-primary hover:underline">
                  تحميل المزيد
                </button>
              )}
            </div>
          )}
        </>
      )}

      {selectedUser && (
        <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
};