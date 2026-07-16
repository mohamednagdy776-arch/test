'use client';
import { useState, useRef, useEffect } from 'react';
import { resolveMediaUrl } from '@/lib/media';
import Image from 'next/image';
import { useDebounce } from '@/hooks/useDebounce';
import {
  useGroups, usePublicGroups, usePrivateGroups, useSearchGroups,
  useGroupAutocomplete, useMyGroups, useJoinGroup, useLeaveGroup,
  useSuggestedGroups, usePendingRequests,
} from '../hooks';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlass, X, Users, Clock, ArrowLeft, CaretDown,
} from '@phosphor-icons/react';
import { useT } from '@/i18n/I18nProvider';


const CATEGORIES = [
  { value: '', label: 'الكل' },
  { value: 'دراسة', label: '📚 دراسة' },
  { value: 'صحة', label: '🌿 صحة' },
  { value: 'رياضة', label: '⚽ رياضة' },
  { value: 'تكنولوجيا', label: '💻 تكنولوجيا' },
  { value: 'فنون', label: '🎨 فنون' },
  { value: 'موسيقى', label: '🎵 موسيقى' },
  { value: 'ألعاب', label: '🎮 ألعاب' },
  { value: 'طعام', label: '🍽️ طعام' },
  { value: 'سفر', label: '✈️ سفر' },
  { value: 'أعمال', label: '💼 أعمال' },
  { value: 'أخرى', label: 'أخرى' },
];

function privacyBadge(privacy: string) {
  if (privacy === 'public')
    return { text: 'عام', style: { background: 'color-mix(in srgb, var(--primary) 10%, var(--muted))', color: 'var(--primary)' } };
  if (privacy === 'private')
    return { text: 'خاص', style: { background: 'color-mix(in srgb, var(--accent) 12%, var(--muted))', color: 'var(--accent)' } };
  return { text: 'سري', style: { background: 'color-mix(in srgb, var(--destructive) 10%, var(--muted))', color: 'var(--destructive)' } };
}

function groupCoverSrc(group: any) {
  if (!group.coverPhoto) return null;
  return resolveMediaUrl(group.coverPhoto);
}

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
  const coverSrc = groupCoverSrc(group);
  const badge = privacyBadge(group.privacy);
  const initial = (group.name || 'م').charAt(0);

  return (
    <div className="rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 group/card"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      {/* Cover */}
      <div className="relative h-28 overflow-hidden">
        {coverSrc ? (
          <Image src={coverSrc} alt={group.name} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/30 text-5xl font-black"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 60%, var(--accent) 100%)' }}>
            {initial}
          </div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)' }} />
        <span className="absolute top-3 right-3 rounded-xl px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-sm"
          style={badge.style}>
          {badge.text}
        </span>
        {group.category && (
          <span className="absolute bottom-2 right-3 text-[11px] text-white/80 font-medium drop-shadow">
            {group.category}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-sm truncate mb-1" style={{ color: 'var(--foreground)' }}>{group.name}</h3>
        <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: 'var(--muted-foreground)' }}>
          {group.description || 'لا يوجد وصف'}
        </p>
        <div className="flex items-center gap-1.5 mb-3">
          <Users size={12} style={{ color: 'var(--muted-foreground)' }} />
          <span className="text-xs tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
            {(group.memberCount || 0).toLocaleString('ar-SA')} عضو
          </span>
        </div>

        <div className="flex gap-2">
          {isPending ? (
            <div className="flex-1 rounded-xl px-3 py-2 text-center text-xs font-semibold"
              style={{ background: 'color-mix(in srgb, var(--accent) 12%, var(--muted))', color: 'var(--accent)' }}>
              <Clock size={11} className="inline ml-1" />
              قيد الانتظار
            </div>
          ) : isMember ? (
            <>
              <button onClick={() => router.push(`/groups/${group.id}`)}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
                عرض
              </button>
              <button onClick={() => onLeave(group.id)} disabled={isLeaving}
                className="px-3 py-2 rounded-xl text-xs font-medium transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
                {isLeaving ? '...' : 'مغادرة'}
              </button>
            </>
          ) : (
            <button onClick={() => onJoin(group.id)} disabled={isJoining}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              style={{ border: '1px solid color-mix(in srgb, var(--primary) 30%, var(--border))', color: 'var(--primary)', background: 'color-mix(in srgb, var(--primary) 5%, var(--card))' }}>
              {isJoining ? '...' : '+ انضم'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export const GroupList = () => {
  const { t } = useT();
  const [activeTab, setActiveTab] = useState<'my' | 'discover' | 'private'>('my');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: publicGroupsData,  isLoading: isLoadingPublic }  = usePublicGroups(1, 20, category);
  const { data: privateGroupsData, isLoading: isLoadingPrivate } = usePrivateGroups();
  const { data: searchData,        isLoading: isLoadingSearch }  = useSearchGroups(debouncedSearch);
  const { data: autocompleteData } = useGroupAutocomplete(debouncedSearch);
  const { data: myGroupsData }     = useMyGroups();
  const { data: suggestedData }    = useSuggestedGroups(5);
  const { data: pendingData }      = usePendingRequests();

  const joinGroup  = useJoinGroup();
  const leaveGroup = useLeaveGroup();

  const isSearching = debouncedSearch.trim().length >= 2;

  const myGroupIds = new Set(
    ((myGroupsData?.data as any[]) || []).map((g: any) => g.id),
  );
  const pendingGroupIds = new Set(
    ((pendingData?.data as any[]) || []).map((g: any) => g.id),
  );
  const suggestions = (autocompleteData?.data as any[]) || [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) setShowAutocomplete(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showAutocomplete || !suggestions.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex((p) => Math.min(p + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex((p) => Math.max(p - 1, -1)); }
    else if (e.key === 'Enter' && selectedIndex >= 0) { e.preventDefault(); setSearchQuery(suggestions[selectedIndex].name); setShowAutocomplete(false); }
    else if (e.key === 'Escape') setShowAutocomplete(false);
  };

  const getGroupsForTab = (): any[] => {
    if (isSearching) {
      if (activeTab === 'my') return ((searchData?.data as any)?.joinedGroups || []);
      if (activeTab === 'private') return [];
      return ((searchData?.data as any)?.otherGroups || []);
    }
    if (activeTab === 'my') {
      // The category select is shown on this tab too, but useMyGroups/the
      // backend "my groups" endpoint never took a category param — selecting
      // one silently did nothing (#68). Filter client-side.
      const list = (myGroupsData?.data as any[]) || [];
      return category ? list.filter((g: any) => g.category === category) : list;
    }
    if (activeTab === 'private') return ((privateGroupsData?.data as any[]) || []);
    return ((publicGroupsData?.data as any[]) || []);
  };

  const isLoading = isSearching ? isLoadingSearch
    : activeTab === 'my' ? false
    : activeTab === 'private' ? isLoadingPrivate
    : isLoadingPublic;

  const displayedGroups = getGroupsForTab();

  const TABS = [
    { key: 'my',       label: 'مجموعاتي',         count: (myGroupsData?.data as any[])?.length || 0 },
    { key: 'discover', label: 'اكتشف',             count: (publicGroupsData?.data as any[])?.length || 0 },
    { key: 'private',  label: 'المجموعات الخاصة', count: (privateGroupsData?.data as any[])?.length || 0 },
  ];

  const emptyMsg =
    isSearching ? 'لا توجد مجموعات مطابقة لبحثك'
    : activeTab === 'my' ? 'لم تنضم لأي مجتمع بعد — اكتشف المجتمعات أدناه'
    : activeTab === 'private' ? 'لا توجد مجتمعات خاصة متاحة'
    : 'لا توجد مجتمعات عامة';

  return (
    <div className="flex gap-6">
      {/* ── Main column ─────────────────────────────────────── */}
      <div className="flex-1 min-w-0">

        {/* Search */}
        <div ref={autocompleteRef} className="relative mb-4">
          <div className="relative">
            <MagnifyingGlass size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--muted-foreground)' }} />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowAutocomplete(true); setSelectedIndex(-1); }}
              onFocus={() => setShowAutocomplete(true)}
              onKeyDown={handleKeyDown}
              placeholder="ابحث عن مجتمع..."
              aria-label="بحث المجتمعات"
              className="w-full pr-10 pl-10 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setShowAutocomplete(false); }}
                aria-label="مسح البحث"
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
                style={{ color: 'var(--muted-foreground)' }}>
                <X size={14} />
              </button>
            )}
          </div>

          {showAutocomplete && suggestions.length > 0 && (
            <div className="absolute z-50 mt-1.5 w-full rounded-2xl shadow-xl overflow-hidden"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              {suggestions.map((s: any, i: number) => (
                <button key={s.id}
                  onClick={() => { setSearchQuery(s.name); setShowAutocomplete(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-right transition-colors"
                  style={i === selectedIndex
                    ? { background: 'color-mix(in srgb, var(--primary) 8%, var(--muted))', color: 'var(--primary)' }
                    : { color: 'var(--foreground)' }}>
                  <Users size={14} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                  <span className="text-sm">{s.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        {!isSearching && (
          <div className="flex gap-1 rounded-xl p-1 mb-4"
            style={{ background: 'var(--muted)' }}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all active:scale-95"
                  style={isActive
                    ? { background: 'var(--card)', color: 'var(--primary)', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }
                    : { color: 'var(--muted-foreground)' }}>
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums"
                      style={isActive
                        ? { background: 'color-mix(in srgb, var(--primary) 12%, var(--muted))', color: 'var(--primary)' }
                        : { background: 'var(--card)', color: 'var(--muted-foreground)' }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Category filter */}
        {!isSearching && activeTab !== 'private' && (
          <div className="mb-4">
            {/* appearance-none removed the native dropdown arrow with nothing
                added in its place, so the filter gave no visual hint it was
                expandable (#224). */}
            <div className="relative inline-block">
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="rounded-xl pr-3 pl-8 py-2 text-sm cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <CaretDown size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            </div>
          </div>
        )}

        {/* Results header */}
        <h2 className="mb-3 text-base font-bold" style={{ color: 'var(--foreground)' }}>
          {isSearching
            ? activeTab === 'my' ? 'مجموعاتي المطابقة' : 'نتائج البحث'
            : activeTab === 'my' ? 'مجموعاتي'
            : activeTab === 'private' ? 'المجموعات الخاصة'
            : 'اكتشف المجتمعات'}
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl animate-pulse" style={{ background: 'var(--muted)' }} />
            ))}
          </div>
        ) : displayedGroups.length === 0 ? (
          <div className="rounded-2xl p-12 text-center"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'color-mix(in srgb, var(--primary) 10%, var(--muted))' }}>
              <Users size={30} weight="light" style={{ color: 'var(--primary)', opacity: 0.5 }} />
            </div>
            <p className="font-bold" style={{ color: 'var(--foreground)' }}>لا توجد مجتمعات</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{emptyMsg}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedGroups.map((g: any) => (
              <GroupCard
                key={g.id}
                group={g}
                isMember={myGroupIds.has(g.id)}
                isPending={pendingGroupIds.has(g.id)}
                onJoin={(id) => joinGroup.mutate(id)}
                onLeave={(id) => leaveGroup.mutate(id)}
                isJoining={joinGroup.isPending}
                isLeaving={leaveGroup.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <div className="w-72 shrink-0 hidden lg:block">
        <div className="sticky top-6 space-y-4">

          {/* Suggested groups */}
          {((suggestedData?.data as any[]) || []).length > 0 && (
            <div className="rounded-2xl p-4"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--foreground)' }}>مجتمعات مقترحة</h3>
              <div className="space-y-3">
                {((suggestedData?.data as any[]) || []).slice(0, 5).map((g: any) => {
                  const coverSrc = groupCoverSrc(g);
                  const initial = (g.name || 'م').charAt(0);
                  return (
                    <div key={g.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                        {coverSrc ? (
                          <Image src={coverSrc} alt={g.name} width={40} height={40} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white"
                            style={{ background: 'linear-gradient(135deg, var(--secondary), var(--primary))' }}>
                            {initial}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{g.name}</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          {(g.memberCount || 0).toLocaleString('ar-SA')} عضو
                        </p>
                      </div>
                      <button
                        onClick={() => joinGroup.mutate(g.id)}
                        disabled={joinGroup.isPending || myGroupIds.has(g.id)}
                        className="shrink-0 text-xs font-bold transition-colors hover:opacity-80 disabled:opacity-40"
                        style={{ color: myGroupIds.has(g.id) ? 'var(--muted-foreground)' : 'var(--primary)' }}>
                        {myGroupIds.has(g.id) ? 'منضم' : 'انضم'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pending requests */}
          {((pendingData?.data as any[]) || []).length > 0 && (
            <div className="rounded-2xl p-4"
              style={{ background: 'color-mix(in srgb, var(--accent) 8%, var(--card))', border: '1px solid color-mix(in srgb, var(--accent) 25%, var(--border))' }}>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={14} style={{ color: 'var(--accent)' }} />
                <h3 className="font-bold text-sm" style={{ color: 'var(--accent)' }}>طلبات معلقة</h3>
              </div>
              <div className="space-y-3">
                {((pendingData?.data as any[]) || []).map((g: any) => (
                  <div key={g.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'color-mix(in srgb, var(--accent) 15%, var(--muted))' }}>
                      <Clock size={14} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{g.name}</p>
                      <p className="text-xs" style={{ color: 'var(--accent)' }}>في انتظار الموافقة</p>
                    </div>
                    {/* A pending request had no way to be undone -- the row just
                        sat here forever (#409). DELETE /:id/leave already
                        deletes the membership row regardless of status, so it
                        doubles as "cancel my pending request". */}
                    <button
                      onClick={() => leaveGroup.mutate(g.id)}
                      disabled={leaveGroup.isPending}
                      className="shrink-0 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      style={{ border: '1px solid color-mix(in srgb, var(--accent) 30%, var(--border))', color: 'var(--accent)' }}>
                      {leaveGroup.isPending ? '...' : t('groups.cancelRequest')}
                    </button>
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
