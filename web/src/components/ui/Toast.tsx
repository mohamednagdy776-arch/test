'use client';
import { createContext, useCallback, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

interface Toast { id: string; message: string; type: 'success' | 'error' | 'info' | 'warning'; }
interface ToastContextType { showToast: (message: string, type?: Toast['type']) => void; }
const ToastContext = createContext<ToastContextType>({ showToast: () => {} });
export function useToast() { return useContext(ToastContext); }

const styles: Record<string, string> = {
  success: 'bg-[#4A8C6F]/15 text-[#4A8C6F] border-[#4A8C6F]/30',
  error:   'bg-[#B05252]/15 text-[#B05252] border-[#B05252]/30',
  info:    'bg-[#D4E8EE] text-[#213448] border-[#94B4C1]/30',
  warning: 'bg-[#C9923A]/15 text-[#C9923A] border-[#C9923A]/30',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 left-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={cn('flex items-center gap-3 rounded-xl border px-4 py-3 shadow-elevated text-sm font-medium animate-slide-up min-w-[280px]', styles[t.type])}>
            <span className="flex-1">{t.message}</span>
            <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))} className="shrink-0 opacity-50 hover:opacity-100">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
