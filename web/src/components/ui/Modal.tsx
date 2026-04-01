'use client';
import { cn } from '@/lib/utils';
import { useEffect, useCallback } from 'react';

interface ModalProps { open: boolean; onClose: () => void; title?: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl'; }
const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  const handleEscape = useCallback((e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }, [onClose]);
  useEffect(() => {
    if (open) { document.addEventListener('keydown', handleEscape); document.body.style.overflow = 'hidden'; }
    return () => { document.removeEventListener('keydown', handleEscape); document.body.style.overflow = ''; };
  }, [open, handleEscape]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="fixed inset-0 bg-[#131F2E]/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative z-50 w-full rounded-2xl bg-[#FDFAF5] shadow-elevated animate-scale-in', sizes[size])}>
        {title && (
          <div className="flex items-center justify-between border-b border-[#C8D8DF] px-6 py-4">
            <h2 className="text-lg font-bold text-[#213448]">{title}</h2>
            <button onClick={onClose} className="rounded-lg p-1.5 text-[#547792] hover:bg-[#D4E8EE] transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
