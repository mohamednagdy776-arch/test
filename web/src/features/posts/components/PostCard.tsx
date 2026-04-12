'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useReactions, useToggleReaction, useComments, useAddComment, useSavePost, useSharePost, useHidePost, useDeletePost, useUpdatePost } from '../hooks';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { ThumbsUp, Heart, Smiley, SmileyMeh, SmileySad, SmileyAngry, ChatCircle, ShareNetwork, MapPin, BookmarkSimple, EyeSlash, Clock, Trash, X, DotsThreeVertical, PaperPlaneTilt, XCircle, CaretLeft } from '@phosphor-icons/react';

const REACTIONS = [
  { type: 'like', icon: ThumbsUp, label: 'إعجاب', activeBg: 'bg-[#D4E8EE]', activeText: 'text-[#213448]' },
  { type: 'love', icon: Heart, label: 'حب', activeBg: 'bg-[#B05252]/15', activeText: 'text-[#B05252]' },
  { type: 'haha', icon: Smiley, label: 'ضحك', activeBg: 'bg-[#F9D71C]/20', activeText: 'text-[#F9D71C]' },
  { type: 'wow', icon: SmileyMeh, label: 'مثير', activeBg: 'bg-[#F9A825]/20', activeText: 'text-[#F9A825]' },
  { type: 'sad', icon: SmileySad, label: 'حزن', activeBg: 'bg-[#5C6BC0]/20', activeText: 'text-[#5C6BC0]' },
  { type: 'angry', icon: SmileyAngry, label: 'غضب', activeBg: 'bg-[#B05252]/20', activeText: 'text-[#B05252]' },
];

function timeAgo(date: string | Date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `${mins} د`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} س`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ي`;
  return new Date(date).toLocaleDateString('ar-EG');
}

function ReactionPicker({ onSelect, onClose }: { onSelect: (type: string) => void; onClose: () => void }) {
  return (
    <div className="absolute bottom-full mb-2 left-0 bg-[#FDFAF5] rounded-2xl shadow-glow-lg border border-[#C8D8DF]/60 p-3 animate-scale-in z-20">
      <div className="flex gap-1">
        {REACTIONS.map((r) => {
          const Icon = r.icon;
          return (
            <button
              key={r.type}
              onClick={() => { onSelect(r.type); onClose(); }}
              className="p-2 hover:bg-[#EAE0CF]/50 rounded-full transition-transform hover:scale-125 hover:shadow-soft"
              title={r.label}
            >
              <Icon size={24} weight="fill" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ReactionDisplay({ postId }: { postId: string }) {
  const { data } = useReactions(postId);
  const toggle = useToggleReaction();
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  
  const reactionData = data?.data;
  const counts: Record<string, number> = reactionData?.counts ?? {};
  const userReaction = reactionData?.userReaction as string | undefined;
  const total: number = reactionData?.total ?? 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowPicker(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentReaction = REACTIONS.find(r => r.type === userReaction);
  const DefaultIcon = ThumbsUp;

  return (
    <div className="relative" ref={pickerRef}>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 active:scale-95',
            'hover:-translate-y-0.5 hover:shadow-soft',
            currentReaction ? `${currentReaction.activeBg} ${currentReaction.activeText}` : 'bg-[#EAE0CF]/60 text-[#547792] hover:bg-[#EAE0CF] hover:text-[#213448]'
          )}
        >
          <span className="text-sm">{currentReaction ? <currentReaction.icon size={16} weight="fill" /> : <DefaultIcon size={16} weight="fill" />}</span>
          <span>{currentReaction?.label || 'إعجاب'}</span>
        </button>
        {total > 0 && <span className="text-xs text-[#547792] font-medium shadow-soft rounded-full px-2 py-0.5">{total}</span>}
      </div>
      {showPicker && <ReactionPicker onSelect={(type) => toggle.mutate({ postId, type })} onClose={() => setShowPicker(false)} />}
    </div>
  );
}

function CommentSection({ postId }: { postId: string }) {
  const [text, setText] = useState('');
  const { data, isLoading } = useComments(postId);
  const addComment = useAddComment();
  const comments: any[] = data?.data ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addComment.mutateAsync({ postId, content: text.trim() });
    setText('');
  };

  return (
    <div className="mt-4 pt-4 border-t border-[#C8D8DF]/40 animate-slide-down">
      {isLoading ? (
        <div className="space-y-3 mb-4">{[1, 2].map(i => <div key={i} className="flex gap-3"><div className="h-8 w-8 rounded-full bg-[#EAE0CF] animate-pulse" /><div className="flex-1 h-12 bg-[#EAE0CF] rounded-2xl animate-pulse" /></div>)}</div>
      ) : comments.length > 0 ? (
        <div className="space-y-3 mb-4 max-h-72 overflow-y-auto scrollbar-thin">
          {comments.map((c: any) => (
            <div key={c.id} className="flex gap-3 group">
              <div className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-[#213448] text-xs font-bold ring-2 ring-[#FDFAF5] shadow-soft" style={{ background: 'linear-gradient(135deg, #D4E8EE 0%, #94B4C1 100%)' }}>
                {(c.user?.profile?.fullName || c.user?.email || '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 rounded-2xl px-4 py-2.5 shadow-card-hover group-hover:shadow-glow transition-all duration-300" style={{ backgroundColor: '#D4E8EE' }}>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-[#213448]">{c.user?.profile?.fullName || c.user?.email?.split('@')[0] || 'مستخدم'}</p>
                  <span className="text-[10px] text-[#547792]">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="text-sm text-[#131F2E] mt-0.5 leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-4 mb-3">
          <ChatCircle size={32} className="text-[#94B4C1] mb-1" />
          <p className="text-xs text-[#547792]">لا توجد تعليقات بعد — كن أول من يعلق</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <div className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-[#213448] text-xs font-bold shadow-soft" style={{ background: 'linear-gradient(135deg, #D4E8EE 0%, #94B4C1 100%)' }}>أ</div>
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="اكتب تعليقاً..."
          className="flex-1 rounded-full border border-[#C8D8DF] bg-[#EAE0CF]/40 px-4 py-2.5 text-sm text-[#131F2E] placeholder:text-[#BFB9AD] focus:outline-none focus:ring-2 focus:ring-[#547792]/20 focus:border-[#547792] focus:bg-[#FDFAF5] focus:shadow-[0_0_0_4px_rgba(84,119,146,0.1)] transition-all duration-300 hover:border-[#94B4C1]" />
        <button type="submit" disabled={!text.trim() || addComment.isPending}
          className="h-9 w-9 rounded-full text-[#FDFAF5] flex items-center justify-center hover:shadow-glow-lg disabled:opacity-40 transition-all duration-300 active:scale-95 hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #213448 0%, #547792 100%)' }}>
          <PaperPlaneTilt size={18} />
        </button>
      </form>
    </div>
  );
}

function ShareModal({ isOpen, onClose, postId, postContent }: { isOpen: boolean; onClose: () => void; postId: string; postContent: string }) {
  const [content, setContent] = useState('');
  const sharePost = useSharePost();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-[#131F2E]/80 backdrop-blur-glass-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-[#FDFAF5] rounded-2xl p-6 animate-scale-in shadow-glow-lg border border-[#C8D8DF]/60">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#213448]">مشاركة المنشور</h3>
          <button onClick={onClose} className="text-[#547792] hover:text-[#213448] hover:scale-110 transition-transform">
            <X size={24} />
          </button>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="ما الذي يدور في ذهنك؟"
          className="w-full rounded-xl border border-[#C8D8DF] bg-[#EAE0CF]/40 px-4 py-3 text-sm text-[#131F2E] placeholder:text-[#BFB9AD] focus:outline-none focus:ring-2 focus:ring-[#547792]/20 focus:border-[#547792] focus:shadow-[0_0_0_4px_rgba(84,119,146,0.1)] mb-4 transition-all duration-300"
          rows={3}
        />
        <div className="bg-[#EAE0CF]/40 rounded-xl p-3 mb-4 shadow-inner-soft">
          <p className="text-xs text-[#547792] line-clamp-2">{postContent}</p>
        </div>
        <button
          onClick={async () => {
            await sharePost.mutateAsync({ postId, content });
            onClose();
          }}
          disabled={sharePost.isPending}
          className="w-full py-3 rounded-xl text-[#FDFAF5] font-medium hover:shadow-glow-lg disabled:opacity-40 transition-all hover:-translate-y-0.5 duration-300"
          style={{ background: 'linear-gradient(135deg, #213448 0%, #547792 100%)' }}
        >
          {sharePost.isPending ? 'جاري النشر...' : 'مشاركة'}
        </button>
      </div>
    </div>
  );
}

function PostMenu({ postId, post, onClose }: { postId: string; post: any; onClose: () => void }) {
  const savePost = useSavePost();
  const hidePost = useHidePost();
  const deletePost = useDeletePost();
  const pinPost = useUpdatePost();

  const menuItems = [
    { label: 'حفظ المنشور', icon: BookmarkSimple, action: () => savePost.mutate(postId) },
    { label: post.isPinned ? 'إلغاء التثبيت' : 'تثبيت المنشور', icon: MapPin, action: () => pinPost.mutate({ postId, data: { isPinned: !post.isPinned } }) },
    { label: 'أرشفة المنشور', icon: BookmarkSimple, action: () => {} },
    { label: 'إخفاء المنشور', icon: EyeSlash, action: () => hidePost.mutate({ postId, hideType: 'not_interested' }) },
    { label: 'عدم الاهتمام', icon: EyeSlash, action: () => hidePost.mutate({ postId, hideType: 'not_interested' }) },
    { label: 'إيقاف مؤقت 30 يوم', icon: Clock, action: () => hidePost.mutate({ postId, hideType: 'snooze', snoozeDays: 30 }) },
    { label: 'حذف المنشور', icon: Trash, action: () => deletePost.mutate(postId), danger: true },
  ];

  return (
    <div className="absolute right-0 top-full mt-2 w-56 bg-[#FDFAF5] rounded-xl shadow-glow-lg border border-[#C8D8DF]/60 py-2 animate-scale-in z-30">
      {menuItems.map((item, i) => {
        const Icon = item.icon;
        return (
          <button
            key={i}
            onClick={() => { item.action(); onClose(); }}
            className={cn('w-full px-4 py-2.5 text-right text-sm hover:bg-[#EAE0CF]/50 flex items-center gap-3 hover:shadow-soft transition-all duration-200', item.danger ? 'text-red-500' : 'text-[#213448]')}
          >
            <Icon size={18} weight={item.danger ? 'fill' : 'regular'} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function LinkPreview({ url, title, description, image }: { url: string; title?: string; description?: string; image?: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block mt-3 rounded-xl overflow-hidden border border-[#C8D8DF]/60 hover:border-[#547792] hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5">
      {image && <div className="aspect-video bg-[#EAE0CF]"><img src={image} alt={title} className="w-full h-full object-cover" /></div>}
      <div className="p-3 bg-[#EAE0CF]/40">
        <p className="text-xs text-[#547792] truncate">{url}</p>
        {title && <p className="text-sm font-semibold text-[#213448] mt-1 line-clamp-1">{title}</p>}
        {description && <p className="text-xs text-[#547792] mt-1 line-clamp-2">{description}</p>}
      </div>
    </a>
  );
}

function PollDisplay({ postId, options }: { postId: string; options: { text: string; votes: number }[] }) {
  const [voted, setVoted] = useState<number | null>(null);
  const [updatedOptions, setUpdatedOptions] = useState(options);

  const totalVotes = updatedOptions.reduce((sum, opt) => sum + opt.votes, 0);

  const handleVote = async (index: number) => {
    if (voted !== null) return;
    try {
      const res = await apiClient.post(`/posts/${postId}/poll/${index}/vote`);
      if (res.data?.data?.pollOptions) {
        setUpdatedOptions(res.data.data.pollOptions);
      }
      setVoted(index);
    } catch (err) {
      console.error('Vote failed', err);
    }
  };

  return (
    <div className="mt-3 space-y-2">
      {updatedOptions.map((opt, i) => {
        const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
        return (
          <button
            key={i}
            onClick={() => handleVote(i)}
            disabled={voted !== null}
            className={cn(
              'w-full relative overflow-hidden rounded-lg text-sm text-right transition-all duration-300',
              'hover:-translate-y-0.5 hover:shadow-soft',
              voted === i ? 'ring-2 ring-[#547792] shadow-glow' : '',
              voted !== null ? 'cursor-default' : 'hover:ring-1 hover:ring-[#547792]'
            )}
          >
            <div
              className={cn(
                'absolute inset-0 transition-all duration-500',
                voted === i ? 'bg-[#547792]/20' : 'bg-[#EAE0CF]'
              )}
              style={{ width: `${percentage}%` }}
            />
            <div className="relative flex items-center justify-between px-3 py-2.5">
              <span className="text-[#213448]">{opt.text}</span>
              <span className="text-[#547792] font-medium">{percentage}%</span>
            </div>
          </button>
        );
      })}
      <p className="text-xs text-[#547792] text-center pt-1 font-medium">{totalVotes} صوت</p>
    </div>
  );
}

export function PostCard({ post, showGroupLink = true }: { post: any; showGroupLink?: boolean }) {
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const userName = post.user?.profile?.fullName || post.user?.email?.split('@')[0] || 'مستخدم';
  const userInitial = userName.charAt(0).toUpperCase();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';
  
  const mediaUrl = post.mediaUrl?.startsWith('/uploads/') ? `${apiUrl}${post.mediaUrl}` : post.mediaUrl;
  const isShared = post.postType === 'shared' || post.originalPostId;

  return (
    <article className="rounded-2xl bg-[#FDFAF5] shadow-card-hover border border-[#C8D8DF]/60 overflow-hidden transition-all duration-300 hover:shadow-glow-lg hover:-translate-y-1 relative group">
      <div className="flex items-center gap-3 p-4 pb-0">
        <div className="relative">
          <div className="h-11 w-11 shrink-0 rounded-full text-[#FDFAF5] font-bold text-sm ring-2 ring-[#FDFAF5] shadow-soft flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #213448 0%, #547792 100%)' }}>{userInitial}</div>
          <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-[#4A8C6F] ring-2 ring-[#FDFAF5] shadow-[0_0_6px_rgba(74,140,111,0.5)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-[#213448]">{userName}</p>
            {post.feeling && <span className="text-xs text-[#547792] font-medium">شعور {post.feeling}</span>}
            {showGroupLink && post.group?.name && <><span className="text-xs text-[#547792]">في</span><a href={`/groups/${post.group.id}`} className="text-xs font-semibold text-[#547792] hover:text-[#213448] hover:underline hover:shadow-soft px-1 rounded transition-all">{post.group.name}</a></>}
          </div>
          <p className="text-[11px] text-[#BFB9AD]">
            {timeAgo(post.createdAt)}
            {post.editedAt && <span className="mr-1">(تم التعديل)</span>}
            {post.location && <> · <MapPin size={12} className="inline" /> {post.location}</>}
          </p>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="rounded-lg p-1.5 text-[#547792] hover:bg-[#D4E8EE] hover:shadow-soft transition-all duration-200 hover:scale-110">
            <DotsThreeVertical size={20} />
          </button>
          {showMenu && <PostMenu postId={post.id} post={post} onClose={() => setShowMenu(false)} />}
        </div>
      </div>

      {post.bgColor && !mediaUrl ? (
        <div className="px-4 py-6 m-4 rounded-xl text-center shadow-card-hover" style={{ backgroundColor: post.bgColor }}>
          <p className="text-lg text-[#FDFAF5] font-medium">{post.content}</p>
        </div>
      ) : (
        <>
          <div className="px-4 py-3">
            <p className="text-sm text-[#131F2E]/85 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            {isShared && post.originalPost && (
              <div className="mt-3 p-3 rounded-xl bg-[#EAE0CF]/40 border border-[#C8D8DF]/40 shadow-card-hover transition-all duration-300 hover:shadow-glow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#547792] to-[#94B4C1] text-[#FDFAF5] text-xs flex items-center justify-center shadow-soft">
                    {(post.originalPost.user?.profile?.fullName || '?').charAt(0)}
                  </div>
                  <span className="text-xs font-medium text-[#213448]">{post.originalPost.user?.profile?.fullName || 'مستخدم'}</span>
                </div>
                <p className="text-sm text-[#547792] line-clamp-2">{post.originalPost.content}</p>
              </div>
            )}
          </div>
          {post.linkUrl && <LinkPreview url={post.linkUrl} title={post.linkTitle} description={post.linkDescription} image={post.linkImage} />}
          {post.pollOptions && <PollDisplay postId={post.id} options={post.pollOptions} />}
          {mediaUrl && (
            <div>
              {post.mediaType === 'video' ? (
                <video src={mediaUrl} controls className="w-full max-h-[480px] object-cover shadow-inner-soft" />
              ) : post.mediaUrls?.length > 1 ? (
                <div className="grid grid-cols-2 gap-1">
                  {post.mediaUrls.map((url: string, i: number) => (
                    <img key={i} src={`${apiUrl}${url}`} alt="" className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300" />
                  ))}
                </div>
              ) : (
                <img src={mediaUrl} alt="" className="w-full max-h-[480px] object-cover hover:scale-[1.02] transition-transform duration-300" loading="lazy" />
              )}
            </div>
          )}
        </>
      )}

      <div className="px-4 py-3 space-y-3">
        <ReactionDisplay postId={post.id} />
        <div className="flex items-center gap-4 pt-2 border-t border-[#C8D8DF]/40">
          <button onClick={() => setShowComments(!showComments)} className={cn(
            'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300 flex-1 justify-center',
            'hover:-translate-y-0.5 hover:shadow-soft',
            showComments ? 'bg-[#D4E8EE] text-[#213448] shadow-soft' : 'text-[#547792] hover:bg-[#EAE0CF]/50'
          )}>
            <ChatCircle size={18} />
            تعليقات
          </button>
          <button onClick={() => setShowShareModal(true)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#547792] hover:bg-[#EAE0CF]/50 hover:-translate-y-0.5 hover:shadow-soft transition-all duration-300 flex-1 justify-center">
            <ShareNetwork size={18} />
            مشاركة
          </button>
        </div>
      </div>
      {showComments && <div className="px-4 pb-4"><CommentSection postId={post.id} /></div>}
      
      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} postId={post.id} postContent={post.content} />
    </article>
  );
}