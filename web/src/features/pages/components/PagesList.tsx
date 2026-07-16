'use client';
import { useState, useRef, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { usePages, useMyPages, useCreatedPages, useSearchPages, useSuggestedPages, useFollowPage, useUnfollowPage } from '../hooks';
import { Spinner } from '@/components/ui/Spinner';
import Link from 'next/link';
import Image from 'next/image';
import { resolveMediaUrl } from '@/lib/media';

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
  { value: 'أعمال', label: 'أخرى' },
];

interface PageCardProps {
  page: any;
  isFollowing: boolean;
  onFollow: (id: string) => void;
  onUnfollow: (id: string) => void;
  isFollowingLoading: boolean;
}

function PageCard({ page, isFollowing, onFollow, onUnfollow, isFollowingLoading }: PageCardProps) {
  return (
    <div className="flex h-full flex-col rounded-xl bg-[var(--card)] shadow-sm hover:shadow-md transition-shadow border border-[var(--border)] overflow-hidden">
      <div className="relative h-24 bg-gradient-to-br from-blue-500/20 to-blue-600/5">
        {page.coverPhoto ? (
          <img src={resolveMediaUrl(page.coverPhoto) ?? ''} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-blue-600/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-[var(--foreground)] truncate">{page.name}</h3>
            {page.category && (
              <span className="text-xs text-[var(--muted-foreground)]">{page.category}</span>
            )}
          </div>
        </div>
        {page.description && (
          <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-2">{page.description}</p>
        )}
        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mb-3">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{page.likeCount || 0} إعجاب</span>
          <span className="mx-1">•</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{page.followerCount || 0} متابع</span>
        </div>
        <div className="flex gap-2 mt-auto">
          {isFollowing ? (
            <button
              onClick={() => onUnfollow(page.id)}
              disabled={isFollowingLoading}
              className="flex-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors disabled:opacity-50"
            >
              {isFollowingLoading ? '...' : 'إلغاء المتابعة'}
            </button>
          ) : (
            <button
              onClick={() => onFollow(page.id)}
              disabled={isFollowingLoading}
              className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isFollowingLoading ? '...' : 'متابعة'}
            </button>
          )}
          <Link
            href={`/pages/${page.id}`}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            عرض
          </Link>
        </div>
      </div>
    </div>
  );
}

export const PagesList = () => {
  const [activeTab, setActiveTab] = useState<'liked' | 'created' | 'discover'>('liked');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: allPagesData, isLoading: isLoadingAll } = usePages(1, 20, category);
  const { data: myPagesData, isLoading: isLoadingMy } = useMyPages();
  const { data: createdPagesData, isLoading: isLoadingCreated } = useCreatedPages();
  const { data: searchData, isLoading: isLoadingSearch } = useSearchPages(debouncedSearch);
  const { data: suggestedData } = useSuggestedPages(5);

  const followPage = useFollowPage();
  const unfollowPage = useUnfollowPage();

  const isSearching = debouncedSearch.trim().length >= 2;

  const followingPageIds = new Set(
    ((myPagesData?.data as any[]) || []).map((p: any) => p.id)
  );

  const getPagesForTab = () => {
    if (isSearching) {
      if (activeTab === 'liked') return ((searchData?.data as any)?.likedPages || []) as any[];
      if (activeTab === 'created') return ((searchData?.data as any)?.createdPages || []) as any[];
      return ((searchData?.data as any)?.otherPages || []) as any[];
    }

    if (activeTab === 'liked') {
      return ((myPagesData?.data as any[]) || []) as any[];
    }
    if (activeTab === 'created') {
      return ((createdPagesData?.data as any[]) || []) as any[];
    }
    return ((allPagesData?.data as any[]) || []) as any[];
  };

  const isLoading = isSearching
    ? isLoadingSearch
    : activeTab === 'liked'
      ? isLoadingMy
      : activeTab === 'created'
        ? isLoadingCreated
        : isLoadingAll;

  const displayedPages = getPagesForTab();

  const tabs = [
    { key: 'liked', label: 'الصفحات المعجب بها', count: (myPagesData?.data as any[])?.length || 0 },
    { key: 'created', label: 'صفحات أنشأتها', count: (createdPagesData?.data as any[])?.length || 0 },
    { key: 'discover', label: 'اكتشف', count: (allPagesData?.data as any[])?.length || 0 },
  ];

  const handleFollow = (id: string) => followPage.mutate(id);
  const handleUnfollow = (id: string) => unfollowPage.mutate(id);

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="relative mb-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن صفحة..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 pr-10 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--muted-foreground)]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
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
                    : 'bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] border border-[var(--border)]'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`mr-1 ${activeTab === tab.key ? 'text-white/80' : 'text-[var(--muted-foreground)]'}`}>
                    ({tab.count})
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {!isSearching && activeTab === 'discover' && (
          <div className="mb-4">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">
            {isSearching
              ? activeTab === 'liked'
                ? 'الصفحات المعجب بها'
                : activeTab === 'created'
                  ? 'صفحاتك'
                  : 'صفحات أخرى'
              : activeTab === 'liked'
                ? 'الصفحات المعجب بها'
                : activeTab === 'created'
                  ? 'صفحات أنشأتها'
                  : 'اكتشف الصفحات'
            }
          </h2>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : displayedPages.length === 0 ? (
            <div className="rounded-xl bg-[var(--card)] p-8 text-center text-[var(--muted-foreground)] border border-[var(--border)]">
              <p className="text-3xl mb-2">📄</p>
              <p className="text-sm">
                {isSearching
                  ? 'لا توجد صفحات مطابقة'
                  : activeTab === 'liked'
                    ? 'لم تعجب بصفحات بعد'
                    : activeTab === 'created'
                      ? 'لم تقم بإنشاء صفحات بعد'
                      : 'لا توجد صفحات'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedPages.map((p: any) => (
                <PageCard
                  key={p.id}
                  page={p}
                  isFollowing={followingPageIds.has(p.id)}
                  onFollow={handleFollow}
                  onUnfollow={handleUnfollow}
                  isFollowingLoading={followPage.isPending || unfollowPage.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-80 shrink-0 hidden lg:block">
        <div className="sticky top-6 space-y-4">
          {(suggestedData?.data as any[]) && (suggestedData?.data as any[]).length > 0 && (
            <div className="rounded-xl bg-[var(--card)] p-4 shadow-sm border border-[var(--border)]">
              <h3 className="font-semibold text-[var(--foreground)] mb-3">صفحات مقترحة</h3>
              <div className="space-y-3">
                {((suggestedData?.data as any[]) || []).slice(0, 5).map((p: any) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <Link href={`/pages/${p.id}`} className="flex flex-1 min-w-0 items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/5 shrink-0 flex items-center justify-center overflow-hidden">
                        {p.coverPhoto ? (
                          <img src={resolveMediaUrl(p.coverPhoto) ?? ''} alt="" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-lg font-bold text-blue-600">{p.name?.[0]}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-[var(--foreground)] truncate">{p.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{p.followerCount || 0} متابع</p>
                      </div>
                    </Link>
                    <button
                      onClick={() => handleFollow(p.id)}
                      disabled={followPage.isPending || followingPageIds.has(p.id)}
                      className="text-xs text-primary hover:text-blue-700 font-medium disabled:text-[var(--muted-foreground)]"
                    >
                      {followingPageIds.has(p.id) ? 'متابعة' : 'متابعة'}
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