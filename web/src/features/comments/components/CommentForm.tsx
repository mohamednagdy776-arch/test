'use client';
import { useState } from 'react';

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSubmit: (content: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function CommentForm({ postId, parentId, onSubmit, placeholder = 'اكتب تعليقاً...', autoFocus = false }: CommentFormProps) {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content.trim());
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <div className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-[#213448] text-xs font-bold" style={{ background: 'linear-gradient(135deg, #D4E8EE, #94B4C1)' }}>أ</div>
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1 rounded-full border border-[#C8D8DF] bg-[#EAE0CF]/40 px-4 py-2.5 text-sm text-[#131F2E] placeholder:text-[#BFB9AD] focus:outline-none focus:ring-2 focus:ring-[#547792]/20 focus:border-[#547792] focus:bg-[#FDFAF5] transition-all duration-200"
      />
      <button 
        type="submit" 
        disabled={!content.trim()}
        className="h-9 w-9 rounded-full text-[#FDFAF5] flex items-center justify-center hover:shadow-md disabled:opacity-40 transition-all duration-200 active:scale-95"
        style={{ background: 'linear-gradient(to left, #213448, #547792)' }}
      >
        <svg className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      </button>
    </form>
  );
}
