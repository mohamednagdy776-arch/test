'use client';
import { useState, useEffect, useCallback } from 'react';
import { useViewStory, useStoryViewers, useAddToHighlight } from '../hooks';
import { cn } from '@/lib/utils';

interface StoryItem {
  id: string;
  user: { id: string; profile?: { fullName?: string }; email?: string };
  mediaUrl?: string;
  mediaType?: string;
  text?: string;
  bgColor?: string;
  createdAt: string;
  viewCount?: number;
}

interface StoryGroup {
  user: { id: string; profile?: { fullName?: string }; email?: string };
  stories: StoryItem[];
}

interface StoryViewerProps {
  stories: StoryGroup[];
  initialUserIndex: number;
  onClose: () => void;
}

export function StoryViewer({ stories, initialUserIndex, onClose }: StoryViewerProps) {
  const [userIndex, setUserIndex] = useState(initialUserIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const currentUser = stories[userIndex];
  const currentStory = currentUser?.stories[storyIndex];
  const viewStory = useViewStory();
  const { data: viewersData } = useStoryViewers(currentStory?.id || '');
  const addToHighlight = useAddToHighlight();
  const [showViewers, setShowViewers] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const viewers = viewersData?.data || [];

  const goNext = useCallback(() => {
    if (storyIndex < currentUser.stories.length - 1) {
      setStoryIndex(storyIndex + 1);
      setProgress(0);
    } else if (userIndex < stories.length - 1) {
      setUserIndex(userIndex + 1);
      setStoryIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [storyIndex, userIndex, currentUser.stories.length, stories.length, onClose]);

  const goPrev = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex(storyIndex - 1);
      setProgress(0);
    } else if (userIndex > 0) {
      setUserIndex(userIndex - 1);
      setStoryIndex(stories[userIndex - 1].stories.length - 1);
      setProgress(0);
    }
  }, [storyIndex, userIndex, stories]);

  useEffect(() => {
    if (currentStory?.id) {
      viewStory.mutate(currentStory.id);
    }
  }, [currentStory?.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          goNext();
          return 0;
        }
        return p + 100 / 50;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [goNext]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, goNext, goPrev]);

  const userName = currentUser?.user?.profile?.fullName || currentUser?.user?.email?.split('@')[0] || 'مستخدم';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-[#131F2E]/90" onClick={onClose} />
      <div className="relative w-full max-w-sm mx-4">
        <div className="flex gap-1 mb-3">
          {currentUser?.stories.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-white/30">
              <div
                className={cn('h-full rounded-full transition-all duration-100', i <= storyIndex ? 'bg-white' : 'bg-white/30')}
                style={{ width: i < storyIndex ? '100%' : i === storyIndex ? `${progress}%` : '0%' }}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full flex items-center justify-center text-xl ring-2 ring-white" style={{ background: 'linear-gradient(135deg, #D4E8EE, #94B4C1)' }}>
            {userName.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">{userName}</p>
            <p className="text-[11px] text-white/70">منذ {Math.floor((Date.now() - new Date(currentStory?.createdAt).getTime()) / 60000)} دقيقة</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowViewers(!showViewers)} className="text-white/70 hover:text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </button>
            <button onClick={() => setShowHighlightMenu(!showHighlightMenu)} className="text-white/70 hover:text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            </button>
            <button onClick={onClose} className="text-white/70 hover:text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {showHighlightMenu && (
          <div className="absolute right-4 top-16 w-48 bg-white rounded-xl shadow-lg py-2 z-10">
            <button onClick={() => { addToHighlight.mutate({ storyId: currentStory.id, name: 'الأهم' }); setShowHighlightMenu(false); }} className="w-full px-4 py-2 text-right text-sm text-[#213448] hover:bg-[#EAE0CF]/50">
              إضافة لأهم اللحظات
            </button>
            <button onClick={() => setShowHighlightMenu(false)} className="w-full px-4 py-2 text-right text-sm text-[#213448] hover:bg-[#EAE0CF]/50">
              إنشاء مجموعة جديدة
            </button>
          </div>
        )}

        {showViewers && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowViewers(false)} />
            <div className="relative w-72 max-h-80 bg-[#FDFAF5] rounded-xl shadow-lg overflow-hidden">
              <div className="p-3 border-b border-[#C8D8DF]/40 flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#213448]">المشاهدون</h3>
                <button onClick={() => setShowViewers(false)} className="text-[#547792]">✕</button>
              </div>
              <div className="overflow-y-auto max-h-60">
                {viewers.length === 0 ? (
                  <p className="p-4 text-sm text-[#547792] text-center">لا يوجد مشاهدون بعد</p>
                ) : (
                  viewers.map((viewer: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 hover:bg-[#EAE0CF]/30">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-[#FDFAF5]" style={{ background: 'linear-gradient(135deg, #547792, #94B4C1)' }}>
                        {(viewer.user?.profile?.fullName || viewer.user?.email || '?').charAt(0)}
                      </div>
                      <span className="text-sm text-[#213448]">{viewer.user?.profile?.fullName || viewer.user?.email?.split('@')[0] || 'مستخدم'}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl overflow-hidden aspect-[9/16] max-h-[70vh] flex items-center justify-center">
          {currentStory?.bgColor ? (
            <div className="w-full h-full flex items-center justify-center p-8" style={{ backgroundColor: currentStory.bgColor }}>
              <p className="text-2xl font-bold text-white text-center">{currentStory.text}</p>
            </div>
          ) : currentStory?.mediaType === 'video' ? (
            <video src={currentStory.mediaUrl} controls className="w-full h-full object-contain" />
          ) : currentStory?.mediaUrl ? (
            <img src={currentStory.mediaUrl} alt="Story" className="w-full h-full object-contain" />
          ) : (
            <div className="text-center p-8">
              <p className="text-xl font-bold text-white mb-2">{currentStory?.text}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-3">
          <button onClick={goPrev} disabled={storyIndex === 0 && userIndex === 0} className="flex-1 rounded-xl py-2.5 text-sm font-medium text-white/70 bg-white/10 hover:bg-white/20 disabled:opacity-30">
            السابق
          </button>
          <button onClick={goNext} className="flex-1 rounded-xl py-2.5 text-sm font-medium text-white bg-[#547792] hover:bg-[#213448]">
            {storyIndex < currentUser.stories.length - 1 || userIndex < stories.length - 1 ? 'التالي' : 'إغلاق'}
          </button>
        </div>
      </div>
    </div>
  );
}