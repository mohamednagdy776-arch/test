'use client';
import { useState, useEffect, useRef } from 'react';
import { useFeed, useRecentFeed, useStories } from '../hooks';
import { PostCard } from './PostCard';
import { PostComposer } from './PostComposer';
import { StoryViewer } from './StoryViewer';
import { StoryCreator } from './StoryCreator';
import { cn, displayName } from '@/lib/utils';

function StoriesBar() {
  const [activeStory, setActiveStory] = useState<number | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const { data: storiesData } = useStories();
  const stories = storiesData?.data || [];

  return (
    <>
      <div className="mb-6 rounded-2xl bg-[#FDFAF5] shadow-card border border-[#C8D8DF]/60 p-4">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {/* Add story */}
          <button
            onClick={() => setShowCreator(true)}
            className="flex flex-col items-center gap-1.5 shrink-0 group"
          >
            <div className="relative h-16 w-16">
              <div className="h-full w-full rounded-full bg-gradient-to-br from-[#D4E8EE] to-[#94B4C1] flex items-center justify-center transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
                {/* Camera icon — corner badge already shows + */}
                <svg className="h-7 w-7 text-[#213448]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </div>
              <div className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-[#547792] border-2 border-[#FDFAF5] flex items-center justify-center">
                <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
            </div>
            <span className="text-[11px] font-medium text-[#547792] group-hover:text-[#213448] transition-colors w-16 text-center truncate">
              إضافة قصة
            </span>
          </button>

          {/* Story groups */}
          {stories.map((group: any, i: number) => (
            <button
              key={group.user?.id || i}
              onClick={() => setActiveStory(i)}
              className="flex flex-col items-center gap-1.5 shrink-0 group"
            >
              <div className="relative h-16 w-16">
                <div
                  className="absolute inset-0 rounded-full p-[2.5px] transition-transform duration-200 group-hover:scale-105 group-active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #547792, #94B4C1, #D4E8EE)' }}
                >
                  <div className="h-full w-full rounded-full bg-[#FDFAF5] flex items-center justify-center">
                    <span className="text-xl font-bold text-[#213448]">{displayName(group.user).charAt(0)}</span>
                  </div>
                </div>
                {group.stories?.length > 1 && (
                  <div className="absolute bottom-0 right-0 h-5 min-w-[20px] px-1 rounded-full bg-[#213448] border-2 border-[#FDFAF5] flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white tabular-nums">{group.stories.length}</span>
                  </div>
                )}
              </div>
              <span className="text-[11px] font-medium text-[#547792] group-hover:text-[#213448] transition-colors w-16 text-center truncate">
                {displayName(group.user)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {activeStory !== null && stories[activeStory] && (
        <StoryViewer
          stories={stories}
          initialUserIndex={activeStory}
          onClose={() => setActiveStory(null)}
        />
      )}

      {showCreator && (
        <StoryCreator
          onClose={() => setShowCreator(false)}
          onSuccess={() => {}}
        />
      )}
    </>
  );
}

export function PostFeed() {
  const [feedType, setFeedType] = useState<'ranked' | 'recent'>('ranked');
  const rankedFeed = useFeed();
  const recentFeed = useRecentFeed();
  const loaderRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = 
    feedType === 'ranked' ? rankedFeed : recentFeed;

  const posts = data?.pages?.flatMap((page: any) => page.data || []) || [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return (
    <div className="space-y-6">
      <div className="h-24 rounded-2xl bg-[#FDFAF5] shadow-card border border-[#C8D8DF]/60 animate-pulse" />
      {[1, 2, 3].map(i => <div key={i} className="h-40 rounded-2xl bg-[#FDFAF5] shadow-card border border-[#C8D8DF]/60 animate-pulse" />)}
    </div>
  );

  if (isError) return (
    <div className="rounded-2xl bg-[#B05252]/10 border border-[#B05252]/30 p-6 text-center">
      <p className="text-sm font-medium text-[#B05252]">فشل تحميل المنشورات</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <PostComposer />
      <StoriesBar />

      <div className="flex items-center justify-between mb-4">
        <div className="flex bg-[#EAE0CF]/50 rounded-xl p-1">
          <button
            onClick={() => setFeedType('ranked')}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors', feedType === 'ranked' ? 'bg-[#547792] text-[#FDFAF5]' : 'text-[#547792]')}
          >
            الأهم
          </button>
          <button
            onClick={() => setFeedType('recent')}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors', feedType === 'recent' ? 'bg-[#547792] text-[#FDFAF5]' : 'text-[#547792]')}
          >
            الأحدث
          </button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl bg-[#FDFAF5] shadow-card border border-[#C8D8DF]/60 p-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl" style={{ background: 'linear-gradient(135deg, #D4E8EE, #94B4C1)' }}>📝</div>
          <p className="text-base font-bold text-[#213448]">لا توجد منشورات بعد</p>
          <p className="text-sm text-[#547792] mt-1">انضم لمجتمعات وشارك منشورات لرؤيتها هنا</p>
        </div>
      ) : (
        <>
          {posts.map((p: any) => <PostCard key={p.id} post={p} />)}
          <div ref={loaderRef} className="h-10 flex items-center justify-center">
            {isFetchingNextPage && <div className="h-8 w-8 border-2 border-[#547792] border-t-transparent rounded-full animate-spin" />}
          </div>
        </>
      )}
    </div>
  );
}