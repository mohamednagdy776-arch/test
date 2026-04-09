'use client';
import { useState, useRef, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useGroups, usePublicGroups, usePrivateGroups, useSearchGroups, useGroupAutocomplete, useMyGroups, useJoinGroup, useLeaveGroup, useSuggestedGroups, usePendingRequests } from '../hooks';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { value: '', label: 'الكل' },
  { value: 'دراسة', label: 'دراسة' },
  { value: 'صحة', label: 'صحة' },
  { value: 'رياضة', label: 'رياضة' },
  { value: 'تكنولوجيا', label: 'تكنولوجيا' },
  { value: 'فنون', label: 'فنون' },
  { value: 'موسيقى', label: 'موسيقى' },
  { value: 'ألعاب', label: 'ألعاب' },
  { value: 'طعام', label: 'طعام' },
  { value: 'سفر', label: 'سفر' },
  { value: 'أعمال', label: 'أعمال' },
  { value: 'أخرى', label: 'أخرى' },
];

interface GroupCardProps {
  group: any;
  isMember: boolean;
  isPending?: boolean;
  onJoin: (id: string) => void;
  onLeave: (id: string) => void;
  isJoining: boolean;
  isLeaving: boolean;
}

function GroupCard({ group, isMember, isPending, onJoin, onLeave, isJoining, isLeaving }: GroupCardProps) {
  const router = useRouter();

  const getPrivacyBadge = () => {
    if (group.privacy === 'public') {
      return { text: 'عام', class: 'bg-green-100 text-green-700' };
    } else if (group.privacy === 'private') {
      return { text: 'خاص', class: 'bg-yellow-100 text-yellow-700' };
    } else {
      return { text: 'سري', class: 'bg-red-100 text-red-700' };
    }
  };

  const privacy = getPrivacyBadge();

  return (
    <div className="rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden">
      <div className="relative h-24 bg-gradient-to-br from-primary/20 to-primary/5">
        {group.coverPhoto && (
          <img src={group.coverPhoto} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">{group.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${privacy.class}`}>
                {privacy.text}
              </span>
              {group.category && (
                <span className="text-xs text-gray-400">{group.category}</span>
              )}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mb-2">{group.description || 'لا يوجد وصف'}</p>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{group.memberCount || 0} عضو</span>
        </div>
        <div className="flex gap-2">
          {isPending ? (
            <button
              disabled
              className="flex-1 rounded-lg bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-600 border border-yellow-200"
            >
              قيد الانتظار
            </button>
          ) : isMember ? (
            <>
              <button
                onClick={() => router.push(`/groups/${group.id}`)}
                className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                عرض
              </button>
              <button
                onClick={() => onLeave(group.id)}
                disabled={isLeaving}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {isLeaving ? '...' : 'مغادرة'}
              </button>
            </>
          ) : (
            <button
              onClick={() => onJoin(group.id)}
              disabled={isJoining}
              className="flex-1 rounded-lg border border-primary px-3 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
            >
              {isJoining ? '...' : 'انضم'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export const GroupList = () => {
  const [activeTab, setActiveTab] = useState<'my' | 'discover' | 'private'>('my');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: allGroupsData, isLoading: isLoadingAll } = useGroups(1, 20, category);
  const { data: publicGroupsData, isLoading: isLoadingPublic } = usePublicGroups(1, 20, category);
  const { data: privateGroupsData, isLoading: isLoadingPrivate } = usePrivateGroups();
  const { data: searchData, isLoading: isLoadingSearch } = useSearchGroups(debouncedSearch);
  const { data: autocompleteData } = useGroupAutocomplete(debouncedSearch);
  const { data: myGroupsData } = useMyGroups();
  const { data: suggestedData } = useSuggestedGroups(5);
  const { data: pendingData } = usePendingRequests();

  const joinGroup = useJoinGroup();
  const leaveGroup = useLeaveGroup();

  const isSearching = debouncedSearch.trim().length >= 2;

  const myGroupIds = new Set(
    ((myGroupsData?.data as any[]) || []).map((g: any) => g.id)
  );

  const pendingGroupIds = new Set(
    ((pendingData?.data as any[]) || []).map((g: any) => g.id)
  );

  const suggestions = (autocompleteData?.data as any[]) || [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showAutocomplete || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      setSearchQuery(suggestions[selectedIndex].name);
      setShowAutocomplete(false);
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false);
    }
  };

  const handleJoin = (id: string) => joinGroup.mutate(id);
  const handleLeave = (id: string) => leaveGroup.mutate(id);

  const getGroupsForTab = () => {
    if (isSearching) {
      if (activeTab === 'my') return ((searchData?.data as any)?.joinedGroups || []) as any[];
      if (activeTab === 'private') return [];
      return ((searchData?.data as any)?.otherGroups || []) as any[];
    }

    if (activeTab === 'my') {
      return ((myGroupsData?.data as any[]) || []) as any[];
    }
    if (activeTab === 'private') {
      return ((privateGroupsData?.data as any[]) || []) as any[];
    }
    return ((publicGroupsData?.data as any[]) || []) as any[];
  };

  const isLoading = isSearching 
    ? isLoadingSearch 
    : activeTab === 'my' 
      ? false 
      : activeTab === 'private' 
        ? isLoadingPrivate 
        : isLoadingPublic;

  const displayedGroups = getGroupsForTab();

  const tabs = [
    { key: 'my', label: 'مجموعاتي', count: (myGroupsData?.data as any[])?.length || 0 },
    { key: 'discover', label: 'عام', count: (publicGroupsData?.data as any[])?.length || 0 },
    { key: 'private', label: 'خاص', count: (privateGroupsData?.data as any[])?.length || 0 },
  ];

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="relative mb-4" ref={autocompleteRef}>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowAutocomplete(true);
                setSelectedIndex(-1);
              }}
              onFocus={() => setShowAutocomplete(true)}
              onKeyDown={handleKeyDown}
              placeholder="ابحث عن مجتمع..."
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowAutocomplete(false);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {showAutocomplete && suggestions.length > 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
              {suggestions.map((s: any, i: number) => (
                <button
                  key={s.id}
                  className={`w-full text-right px-4 py-2.5 text-sm transition-colors ${
                    i === selectedIndex ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setSearchQuery(s.name);
                    setShowAutocomplete(false);
                  }}
                >
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {s.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {!isSearching && (
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`mr-1 ${activeTab === tab.key ? 'text-white/80' : 'text-gray-400'}`}>
                    ({tab.count})
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {!isSearching && activeTab !== 'private' && (
          <div className="mb-4">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <h2 className="mb-3 text-lg font-bold text-gray-900">
            {isSearching 
              ? activeTab === 'my' 
                ? 'مجموعاتي المطابقة' 
                : activeTab === 'private'
                  ? 'مجموعات خاصة'
                  : 'مجتمعات أخرى'
              : activeTab === 'my' 
                ? 'مجموعاتي' 
                : activeTab === 'private'
                  ? 'المجموعات الخاصة'
                  : 'اكتشف المجموعات'
            }
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 rounded-xl bg-white animate-pulse" />
              ))}
            </div>
          ) : displayedGroups.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center text-gray-400 border border-gray-100">
              <p className="text-3xl mb-2">👥</p>
              <p className="text-sm">
                {isSearching 
                  ? 'لا توجد مجموعات مطابقة' 
                  : activeTab === 'my' 
                    ? 'لم تنضم لأي مجموعة بعد' 
                    : activeTab === 'private'
                      ? 'لا توجد مجموعات خاصة'
                      : 'لا توجد مجموعات عامة'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedGroups.map((g: any) => (
                <GroupCard
                  key={g.id}
                  group={g}
                  isMember={myGroupIds.has(g.id)}
                  isPending={pendingGroupIds.has(g.id)}
                  onJoin={handleJoin}
                  onLeave={handleLeave}
                  isJoining={joinGroup.isPending}
                  isLeaving={leaveGroup.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-80 shrink-0 hidden lg:block">
        <div className="sticky top-6 space-y-4">
          {(suggestedData?.data as any[]) && (suggestedData?.data as any[]).length > 0 && (
            <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">مجموعات مقترحة</h3>
              <div className="space-y-3">
                {((suggestedData?.data as any[]) || []).slice(0, 5).map((g: any) => (
                  <div key={g.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 shrink-0 flex items-center justify-center">
                      {g.coverPhoto ? (
                        <img src={g.coverPhoto} alt="" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{g.name}</p>
                      <p className="text-xs text-gray-400">{g.memberCount || 0} عضو</p>
                    </div>
                    <button
                      onClick={() => handleJoin(g.id)}
                      disabled={joinGroup.isPending || myGroupIds.has(g.id)}
                      className="text-xs text-primary hover:text-blue-700 font-medium disabled:text-gray-400"
                    >
                      {myGroupIds.has(g.id) ? 'joined' : 'انضم'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(pendingData?.data as any[]) && (pendingData?.data as any[]).length > 0 && (
            <div className="rounded-xl bg-yellow-50 p-4 shadow-sm border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-3">طلبات معلقة</h3>
              <div className="space-y-3">
                {((pendingData?.data as any[]) || []).map((g: any) => (
                  <div key={g.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{g.name}</p>
                      <p className="text-xs text-yellow-600">في انتظار الموافقة</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
