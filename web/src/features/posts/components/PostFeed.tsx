'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useFeed, useRecentFeed, useStories, useCreateStory } from '../hooks';
import { PostCard } from './PostCard';
import { PostComposer } from './PostComposer';
import { StoryViewer } from './StoryViewer';
import { StoryCreator } from './StoryCreator';
import { cn } from '@/lib/utils';

function StoriesBar() {
  const [activeStory, setActiveStory] = useState<number | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const { data: storiesData } = useStories();
  const createStory = useCreateStory();
  const stories = storiesData?.data || [];

  return (
    <>
      <div className="mb-6 rounded-2xl bg-[#FDFAF5] shadow-card border border-[#C8D8DF]/60 p-4">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => setShowCreator(true)}
            className="flex flex-col items-center gap-1.5 shrink-0 group"
          >
            <div className="relative h-16 w-16 rounded-full bg-[#EAE0CF] border-2 border-dashed border-[#C8D8DF] flex items-center justify-center transition-all duration-300 group-hover:border-[#547792] group-hover:bg-[#D4E8EE]">
              <svg className="h-6 w-6 text-[#547792]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-[#547792] group-hover:text-[#213448] transition-colors truncate w-16 text-center">
              إضافة قصة
            </span>
          </button>

          {stories.map((group: any, i: number) => (
            <button
              key={group.user?.id || i}
              onClick={() => setActiveStory(i)}
              className="flex flex-col items-center gap-1.5 shrink-0 group"
            >
              <div
                className="relative h-16 w-16 rounded-full flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-105 p-[3px]"
                style={{ background: 'linear-gradient(135deg, #547792, #94B4C1)' }}
              >
                <div className="h-full w-full rounded-full bg-[#FDFAF5] flex items-center justify-center">
                  <span className="text-2xl">{(group.user?.profile?.fullName || group.user?.email || '?').charAt(0)}</span>
                </div>
              </div>
              <span className="text-[11px] font-medium text-[#547792] group-hover:text-[#213448] transition-colors truncate w-16 text-center">
                {group.user?.profile?.fullName || group.user?.email?.split('@')[0] || 'مستخدم'}
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