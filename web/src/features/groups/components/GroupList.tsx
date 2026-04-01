'use client';
import { useState, useRef, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useGroups, useSearchGroups, useGroupAutocomplete, useMyGroups, useJoinGroup, useLeaveGroup } from '../hooks';
import { useRouter } from 'next/navigation';

interface GroupCardProps {
  group: any;
  isMember: boolean;
  onJoin: (id: string) => void;
  onLeave: (id: string) => void;
  isJoining: boolean;
  isLeaving: boolean;
  memberCount?: number;
}

function GroupCard({ group, isMember, onJoin, onLeave, isJoining, isLeaving, memberCount }: GroupCardProps) {
  const router = useRouter();

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{group.name}</h3>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
              group.privacy === 'public' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {group.privacy === 'public' ? 'عام' : 'خاص'}
            </span>
          </div>
          <p className="text-sm text-gray-500 line-clamp-2">{group.description || 'لا يوجد وصف'}</p>
          {memberCount !== undefined && (
            <p className="mt-1 text-xs text-gray-400">{memberCount} عضو</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5 shrink-0">
          {isMember ? (
            <>
              <button
                onClick={() => router.push(`/groups/${group.id}`)}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
              >
                عرض
              </button>
              <button
                onClick={() => onLeave(group.id)}
                disabled={isLeaving}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {isLeaving ? '...' : 'مغادرة'}
              </button>
            </>
          ) : (
            <button
              onClick={() => onJoin(group.id)}
              disabled={isJoining}
              className="rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: allGroupsData, isLoading: isLoadingAll } = useGroups();
  const { data: searchData, isLoading: isLoadingSearch } = useSearchGroups(debouncedSearch);
  const { data: autocompleteData } = useGroupAutocomplete(debouncedSearch);
  const { data: myGroupsData } = useMyGroups();

  const joinGroup = useJoinGroup();
  const leaveGroup = useLeaveGroup();

  const isSearching = debouncedSearch.trim().length >= 2;

  // My group IDs
  const myGroupIds = new Set(
    ((myGroupsData?.data as any[]) || []).map((g: any) => g.id)
  );

  // Autocomplete suggestions
  const suggestions = (autocompleteData?.data as any[]) || [];

  // Close autocomplete on click outside
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

  // Render sections
  const joinedGroups = isSearching
    ? ((searchData?.data as any)?.joinedGroups || [])
    : ((myGroupsData?.data as any[]) || []);

  const otherGroups = isSearching
    ? ((searchData?.data as any)?.otherGroups || [])
    : ((allGroupsData?.data as any[]) || []).filter((g: any) => !myGroupIds.has(g.id));

  const isLoading = isSearching ? isLoadingSearch : isLoadingAll;

  return (
    <div>
      {/* Search Bar */}
      <div className="relative mb-6" ref={autocompleteRef}>
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

        {/* Autocomplete Dropdown */}
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

      {/* My Groups Section */}
      <div className="mb-8">
        <h2 className="mb-3 text-lg font-bold text-gray-900">
          {isSearching ? 'مجتمعياتي المطابقة' : 'مجتمعياتي'}
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[1, 2].map((i) => <div key={i} className="h-28 rounded-xl bg-white animate-pulse" />)}
          </div>
        ) : joinedGroups.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-center text-gray-400 border border-gray-100">
            <p className="text-2xl mb-2">👥</p>
            <p className="text-sm">
              {isSearching ? 'لا توجد مجتمعيات مطابقة في قائمتك' : 'لم تنضم لأي مجتمع بعد'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {joinedGroups.map((g: any) => (
              <GroupCard
                key={g.id}
                group={g}
                isMember={true}
                onJoin={handleJoin}
                onLeave={handleLeave}
                isJoining={joinGroup.isPending}
                isLeaving={leaveGroup.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Other Groups Section */}
      <div>
        <h2 className="mb-3 text-lg font-bold text-gray-900">
          {isSearching ? 'مجتمعات أخرى' : 'اكتشف مجتمعات'}
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-xl bg-white animate-pulse" />)}
          </div>
        ) : otherGroups.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-center text-gray-400 border border-gray-100">
            <p className="text-2xl mb-2">🔍</p>
            <p className="text-sm">
              {isSearching ? 'لا توجد مجتمعات أخرى مطابقة' : 'لا توجد مجتمعات أخرى'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {otherGroups.map((g: any) => (
              <GroupCard
                key={g.id}
                group={g}
                isMember={false}
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
  );
};
