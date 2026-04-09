'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Comment {
  id: string;
  content: string;
  user: {
    id: string;
    email?: string;
    profile?: { fullName?: string; avatar?: string };
  };
  isPinned: boolean;
  editedAt?: string;
  createdAt: string;
  replies?: Comment[];
  reactions?: {
    type: string;
    count: number;
    users: { id: string }[];
  }[];
}

interface CommentListProps {
  comments: Comment[];
  postId: string;
  currentUserId?: string;
  onReply: (commentId: string, content: string) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onPin: (commentId: string, isPinned: boolean) => void;
  onReact: (commentId: string, type: string) => void;
  isAuthor?: boolean;
}

const REACTIONS = [
  { type: 'like', icon: '👍', label: 'إعجاب' },
  { type: 'love', icon: '❤️', label: 'حب' },
  { type: 'haha', icon: '😂', label: 'ضحك' },
  { type: 'wow', icon: '😮', label: 'مثير' },
  { type: 'sad', icon: '😢', label: 'حزن' },
  { type: 'angry', icon: '😠', label: 'غضب' },
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

function getInitials(user: Comment['user']) {
  return (user.profile?.fullName || user.email || '?').charAt(0).toUpperCase();
}

function ReactionPicker({ onSelect, onClose }: { onSelect: (type: string) => void; onClose: () => void }) {
  return (
    <div className="absolute bottom-full mb-2 left-0 bg-[#FDFAF5] rounded-2xl shadow-lg border border-[#C8D8DF]/60 p-3 z-20">
      <div className="flex gap-1">
        {REACTIONS.map((r) => (
          <button
            key={r.type}
            onClick={() => { onSelect(r.type); onClose(); }}
            className="text-2xl p-2 hover:bg-[#EAE0CF]/50 rounded-full transition-transform hover:scale-125"
            title={r.label}
          >
            {r.icon}
          </button>
        ))}
      </div>
    </div>
  );
}

function CommentItem({ 
  comment, 
  postId, 
  currentUserId, 
  onReply, 
  onEdit, 
  onDelete, 
  onPin, 
  onReact,
  isAuthor,
  depth = 0 
}: { 
  comment: Comment; 
  postId: string;
  currentUserId?: string;
  onReply: (commentId: string, content: string) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onPin: (commentId: string, isPinned: boolean) => void;
  onReact: (commentId: string, type: string) => void;
  isAuthor?: boolean;
  depth?: number;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showMenu, setShowMenu] = useState(false);

  const isOwnComment = currentUserId === comment.user.id;
  const canReply = depth < 1;

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim()) {
      onReply(comment.id, replyContent.trim());
      setReplyContent('');
      setShowReplyForm(false);
    }
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editContent.trim() && editContent !== comment.content) {
      onEdit(comment.id, editContent.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="flex gap-3">
      <div className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-[#213448] text-xs font-bold ring-2 ring-[#FDFAF5]" style={{ background: 'linear-gradient(135deg, #D4E8EE, #94B4C1)' }}>
        {getInitials(comment.user)}
      </div>
      <div className="flex-1">
        <div className="rounded-2xl px-4 py-2.5" style={{ backgroundColor: '#D4E8EE' }}>
          {isEditing ? (
            <form onSubmit={handleSubmitEdit} className="flex gap-2">
              <input
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="flex-1 bg-transparent text-sm text-[#131F2E] focus:outline-none"
                autoFocus
              />
              <button type="submit" className="text-xs text-[#547792] font-medium">حفظ</button>
              <button type="button" onClick={() => setIsEditing(false)} className="text-xs text-[#547792]">إلغاء</button>
            </form>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-[#213448]">{comment.user.profile?.fullName || comment.user.email?.split('@')[0] || 'مستخدم'}</p>
                {comment.isPinned && <span className="text-[10px] text-[#547792]">📌</span>}
                <span className="text-[10px] text-[#547792]">{timeAgo(comment.createdAt)}</span>
                {comment.editedAt && <span className="text-[10px] text-[#547792]">(معدل)</span>}
              </div>
              <p className="text-sm text-[#131F2E] mt-0.5 leading-relaxed">{comment.content}</p>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 mt-1 px-2">
          <div className="relative">
            <button 
              onClick={() => setShowReactions(!showReactions)}
              className="text-xs text-[#547792] hover:underline"
            >
              👍 إعجاب
            </button>
            {showReactions && (
              <ReactionPicker 
                onSelect={(type) => onReact(comment.id, type)} 
                onClose={() => setShowReactions(false)} 
              />
            )}
          </div>
          
          {canReply && (
            <button onClick={() => setShowReplyForm(!showReplyForm)} className="text-xs text-[#547792] hover:underline">
              رد
            </button>
          )}

          {(isOwnComment || isAuthor) && (
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="text-xs text-[#547792]">⋮</button>
              {showMenu && (
                <div className="absolute left-0 top-full mt-1 bg-[#FDFAF5] rounded-lg shadow-lg border border-[#C8D8DF]/60 py-1 z-10 min-w-[120px]">
                  {isOwnComment && (
                    <>
                      <button onClick={() => { setIsEditing(true); setShowMenu(false); }} className="w-full text-right px-3 py-1.5 text-sm hover:bg-[#EAE0CF]/50">تعديل</button>
                      <button onClick={() => { onDelete(comment.id); setShowMenu(false); }} className="w-full text-right px-3 py-1.5 text-sm text-red-500 hover:bg-[#EAE0CF]/50">حذف</button>
                    </>
                  )}
                  {isAuthor && !comment.isPinned && (
                    <button onClick={() => { onPin(comment.id, true); setShowMenu(false); }} className="w-full text-right px-3 py-1.5 text-sm hover:bg-[#EAE0CF]/50">تثبيت</button>
                  )}
                  {isAuthor && comment.isPinned && (
                    <button onClick={() => { onPin(comment.id, false); setShowMenu(false); }} className="w-full text-right px-3 py-1.5 text-sm hover:bg-[#EAE0CF]/50">إلغاء التثبيت</button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {showReplyForm && (
          <form onSubmit={handleSubmitReply} className="flex gap-2 mt-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="اكتب رداً..."
              className="flex-1 rounded-full border border-[#C8D8DF] bg-[#EAE0CF]/40 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#547792]/20"
              autoFocus
            />
            <button type="submit" disabled={!replyContent.trim()} className="text-xs text-[#547792] font-medium disabled:opacity-40">
              إرسال
            </button>
          </form>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3 pl-4 border-l-2 border-[#C8D8DF]/40">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                postId={postId}
                currentUserId={currentUserId}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onPin={onPin}
                onReact={onReact}
                isAuthor={isAuthor}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CommentList({ comments, postId, currentUserId, onReply, onEdit, onDelete, onPin, onReact, isAuthor }: CommentListProps) {
  if (!comments || comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-4">
        <p className="text-2xl mb-1">💬</p>
        <p className="text-xs text-[#547792]">لا توجد تعليقات بعد — كن أول من يعلق</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-72 overflow-y-auto scrollbar-thin">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          currentUserId={currentUserId}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          onPin={onPin}
          onReact={onReact}
          isAuthor={isAuthor}
        />
      ))}
    </div>
  );
}
