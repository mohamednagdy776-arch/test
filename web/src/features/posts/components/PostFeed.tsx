'use client';
import { useState, useEffect, useCallback } from 'react';
import { useFeed, useComments, useAddComment, useReactions, useToggleReaction } from '../hooks';
import { cn } from '@/lib/utils';

// ─── Story Viewer Modal ──────────────────────────────────────
function StoryViewer({ stories, initialIndex, onClose }: { stories: any[]; initialIndex: number; onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const current = stories[currentIndex];

  const goNext = useCallback(() => {
    if (currentIndex < stories.length - 1) setCurrentIndex(currentIndex + 1);
    else onClose();
  }, [currentIndex, stories.length, onClose]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }, [currentIndex]);

  useEffect(() => {
    const timer = setTimeout(goNext, 5000);
    return () => clearTimeout(timer);
  }, [currentIndex, goNext]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goNext();
      if (e.key === 'ArrowRight') goPrev();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, goNext, goPrev]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-[#131F2E]/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm mx-4 animate-scale-in">
        {/* Progress bars */}
        <div className="flex gap-1 mb-3">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-[#547792]/30">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-5000',
                  i < currentIndex ? 'bg-[#FDFAF5] w-full' : i === currentIndex ? 'bg-[#FDFAF5] animate-[progress_5s_linear]' : 'w-0'
                )}
                style={i === currentIndex ? { animation: 'progress 5s linear forwards' } : {}}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full flex items-center justify-center text-xl ring-2 ring-[#94B4C1]" style={{ background: 'linear-gradient(135deg, #D4E8EE, #94B4C1)' }}>
            {current.emoji}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-[#FDFAF5]">{current.name}</p>
            <p className="text-[11px] text-[#94B4C1]">منذ ساعتين</p>
          </div>
          <button onClick={onClose} className="text-[#94B4C1] hover:text-[#FDFAF5] transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Story content */}
        <div className="rounded-2xl overflow-hidden bg-[#213448] aspect-[9/16] max-h-[60vh] flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">{current.emoji}</div>
            <p className="text-xl font-bold text-[#FDFAF5] mb-2">قصة {current.name}</p>
            <p className="text-sm text-[#94B4C1]">هذا محتوى القصة — يمكن إضافة صور وفيديوهات هنا</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-3">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="flex-1 rounded-xl py-2.5 text-sm font-medium text-[#94B4C1] hover:bg-[#213448] disabled:opacity-30 transition-colors"
          >
            السابق
          </button>
          <button
            onClick={goNext}
            className="flex-1 rounded-xl py-2.5 text-sm font-medium text-[#FDFAF5] hover:bg-[#547792] transition-colors"
            style={{ background: '#213448' }}
          >
            {currentIndex < stories.length - 1 ? 'التالي' : 'إغلاق'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Stories Bar ─────────────────────────────────────────────
function StoriesBar() {
  const [activeStory, setActiveStory] = useState<number | null>(null);

  const stories = [
    { id: '1', name: 'أحمد', emoji: '👨‍💼', hasStory: true },
    { id: '2', name: 'فاطمة', emoji: '👩‍🦰', hasStory: true },
    { id: '3', name: 'محمد', emoji: '👨‍🦱', hasStory: true },
    { id: '4', name: 'نور', emoji: '👩‍🎓', hasStory: true },
    { id: '5', name: 'علي', emoji: '👨‍🔧', hasStory: true },
  ];

  return (
    <>
      <div className="mb-6 rounded-2xl bg-[#FDFAF5] shadow-card border border-[#C8D8DF]/60 p-4">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {/* Create story */}
          <button
            onClick={() => alert('ميزة إضافة القصة قادمة قريباً!')}
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

          {/* User stories */}
          {stories.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveStory(i)}
              className="flex flex-col items-center gap-1.5 shrink-0 group"
            >
              <div
                className="relative h-16 w-16 rounded-full flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-105 p-[3px]"
                style={{ background: 'linear-gradient(135deg, #547792, #94B4C1)' }}
              >
                <div className="h-full w-full rounded-full bg-[#FDFAF5] flex items-center justify-center">
                  <span className="text-2xl">{s.emoji}</span>
                </div>
              </div>
              <span className="text-[11px] font-medium text-[#547792] group-hover:text-[#213448] transition-colors truncate w-16 text-center">
                {s.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Story viewer modal */}
      {activeStory !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={activeStory}
          onClose={() => setActiveStory(null)}
        />
      )}
    </>
  );
}

// ─── Comment Section ──────────────────────────────────────────
function CommentSection({ postId }: { postId: string }) {
  const [text, setText] = useState('');
  const { data, isLoading } = useComments(postId);
  const addComment = useAddComment();
  const comments: any[] = data?.data ?? [];
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!text.trim()) return;
    await addComment.mutateAsync({ postId, content: text.trim() }); setText('');
  };
  return (
    <div className="mt-4 pt-4 border-t border-[#C8D8DF]/40 animate-slide-down">
      {isLoading ? (
        <div className="space-y-3 mb-4">{[1,2].map(i => <div key={i} className="flex gap-3"><div className="h-8 w-8 rounded-full bg-[#EAE0CF] animate-pulse"/><div className="flex-1 h-12 bg-[#EAE0CF] rounded-2xl animate-pulse"/></div>)}</div>
      ) : comments.length > 0 ? (
        <div className="space-y-3 mb-4 max-h-72 overflow-y-auto scrollbar-thin">
          {comments.map((c: any) => (
            <div key={c.id} className="flex gap-3">
              <div className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-[#213448] text-xs font-bold ring-2 ring-[#FDFAF5]" style={{ background: 'linear-gradient(135deg, #D4E8EE, #94B4C1)' }}>
                {(c.user?.profile?.fullName || c.user?.email || '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 rounded-2xl px-4 py-2.5" style={{ backgroundColor: '#D4E8EE' }}>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-[#213448]">{c.user?.profile?.fullName || c.user?.email?.split('@')[0] || 'مستخدم'}</p>
                  <span className="text-[10px] text-[#547792]">{new Date(c.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}</span>
                </div>
                <p className="text-sm text-[#131F2E] mt-0.5 leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-4 mb-3">
          <p className="text-2xl mb-1">💬</p>
          <p className="text-xs text-[#547792]">لا توجد تعليقات بعد — كن أول من يعلق</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <div className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-[#213448] text-xs font-bold" style={{ background: 'linear-gradient(135deg, #D4E8EE, #94B4C1)' }}>أ</div>
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="اكتب تعليقاً..."
          className="flex-1 rounded-full border border-[#C8D8DF] bg-[#EAE0CF]/40 px-4 py-2.5 text-sm text-[#131F2E] placeholder:text-[#BFB9AD] focus:outline-none focus:ring-2 focus:ring-[#547792]/20 focus:border-[#547792] focus:bg-[#FDFAF5] transition-all duration-200" />
        <button type="submit" disabled={!text.trim() || addComment.isPending}
          className="h-9 w-9 rounded-full text-[#FDFAF5] flex items-center justify-center hover:shadow-md disabled:opacity-40 transition-all duration-200 active:scale-95"
          style={{ background: 'linear-gradient(to left, #213448, #547792)' }}>
          <svg className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>
        </button>
      </form>
    </div>
  );
}

// ─── Reaction Bar ─────────────────────────────────────────────
function ReactionBar({ postId }: { postId: string }) {
  const { data } = useReactions(postId);
  const toggle = useToggleReaction();
  const reactionData = data?.data;
  const counts: Record<string, number> = reactionData?.counts ?? {};
  const total: number = reactionData?.total ?? 0;
  const reactions = [
    { type: 'like', icon: '👍', activeBg: 'bg-[#D4E8EE]', activeText: 'text-[#213448]' },
    { type: 'love', icon: '❤️', activeBg: 'bg-[#B05252]/15', activeText: 'text-[#B05252]' },
    { type: 'support', icon: '🤝', activeBg: 'bg-[#4A8C6F]/15', activeText: 'text-[#4A8C6F]' },
  ];
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        {reactions.map((r) => {
          const isActive = !!counts[r.type];
          return (
            <button key={r.type} onClick={() => toggle.mutate({ postId, type: r.type })} disabled={toggle.isPending}
              className={cn('flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 active:scale-95',
                isActive ? `${r.activeBg} ${r.activeText}` : 'bg-[#EAE0CF]/60 text-[#547792] hover:bg-[#EAE0CF] hover:text-[#213448]')}>
              <span className="text-sm">{r.icon}</span>{counts[r.type] || ''}
            </button>
          );
        })}
      </div>
      {total > 0 && <span className="text-xs text-[#547792] font-medium">{total} إعجاب</span>}
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────
export function PostCard({ post, showGroupLink = true }: { post: any; showGroupLink?: boolean }) {
  const [showComments, setShowComments] = useState(false);
  const userName = post.user?.profile?.fullName || post.user?.email?.split('@')[0] || 'مستخدم';
  const userInitial = userName.charAt(0).toUpperCase();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';
  const mediaUrl = post.mediaUrl?.startsWith('/uploads/') ? `${apiUrl}${post.mediaUrl}` : post.mediaUrl;
  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'الآن';
    if (mins < 60) return `${mins} د`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} س`;
    return `${Math.floor(hours / 24)} ي`;
  };
  return (
    <article className="rounded-2xl bg-[#FDFAF5] shadow-card border border-[#C8D8DF]/60 overflow-hidden transition-all duration-300 hover:shadow-card-hover">
      <div className="flex items-center gap-3 p-4 pb-0">
        <div className="relative">
          <div className="h-11 w-11 shrink-0 rounded-full text-[#FDFAF5] font-bold text-sm ring-2 ring-[#FDFAF5] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #213448, #547792)' }}>{userInitial}</div>
          <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-[#4A8C6F] ring-2 ring-[#FDFAF5]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-[#213448]">{userName}</p>
            {showGroupLink && post.group?.name && <><span className="text-xs text-[#547792]">في</span><a href={`/groups/${post.group.id}`} className="text-xs font-semibold text-[#547792] hover:text-[#213448] hover:underline">{post.group.name}</a></>}
          </div>
          <p className="text-[11px] text-[#BFB9AD]">{timeAgo(post.createdAt)}</p>
        </div>
        <button className="rounded-lg p-1.5 text-[#547792] hover:bg-[#D4E8EE] transition-colors">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/></svg>
        </button>
      </div>
      <div className="px-4 py-3"><p className="text-sm text-[#131F2E]/85 leading-relaxed whitespace-pre-wrap">{post.content}</p></div>
      {mediaUrl && <div>{post.mediaType === 'video' ? <video src={mediaUrl} controls className="w-full max-h-[480px] object-cover"/> : <img src={mediaUrl} alt="" className="w-full max-h-[480px] object-cover" loading="lazy"/>}</div>}
      <div className="px-4 py-3 space-y-3">
        <ReactionBar postId={post.id} />
        <div className="flex items-center gap-4 pt-2 border-t border-[#C8D8DF]/40">
          <button onClick={() => setShowComments(!showComments)} className={cn('flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 flex-1 justify-center',
            showComments ? 'bg-[#D4E8EE] text-[#213448]' : 'text-[#547792] hover:bg-[#EAE0CF]/50')}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/></svg>
            تعليقات
          </button>
          <button className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#547792] hover:bg-[#EAE0CF]/50 transition-all duration-200 flex-1 justify-center">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"/></svg>
            مشاركة
          </button>
        </div>
      </div>
      {showComments && <div className="px-4 pb-4"><CommentSection postId={post.id} /></div>}
    </article>
  );
}

// ─── Post Feed ────────────────────────────────────────────────
export const PostFeed = () => {
  const { data, isLoading, isError } = useFeed();
  if (isLoading) return <div className="space-y-6">{[1,2,3].map(i => <div key={i} className="h-40 rounded-2xl bg-[#FDFAF5] shadow-card border border-[#C8D8DF]/60 animate-pulse"/>)}</div>;
  if (isError) return <div className="rounded-2xl bg-[#B05252]/10 border border-[#B05252]/30 p-6 text-center"><p className="text-sm font-medium text-[#B05252]">فشل تحميل المنشورات</p></div>;
  const posts: any[] = data?.data ?? [];
  return (
    <div className="space-y-6">
      <StoriesBar />
      {posts.length === 0 ? (
        <div className="rounded-2xl bg-[#FDFAF5] shadow-card border border-[#C8D8DF]/60 p-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl" style={{ background: 'linear-gradient(135deg, #D4E8EE, #94B4C1)' }}>📝</div>
          <p className="text-base font-bold text-[#213448]">لا توجد منشورات بعد</p>
          <p className="text-sm text-[#547792] mt-1">انضم لمجتمعات وشارك منشورات لرؤيتها هنا</p>
        </div>
      ) : posts.map((p) => <PostCard key={p.id} post={p} />)}
    </div>
  );
};
