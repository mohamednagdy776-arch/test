'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

type Stage = 'idle' | 'analyzing' | 'generating' | 'rendering' | 'done' | 'error';

const LABELS: Record<string, string> = {
  analyzing:  'الذكاء الاصطناعي يحلل ملامح الوجوه...',
  generating: 'يبني توقّع ملامح الطفل...',
  rendering:  'يرسم صورة الطفل...',
  done:       'اكتمل! ✨',
  error:      'حدث خطأ، يرجى المحاولة مجدداً',
};

const STEPS: Stage[] = ['analyzing', 'generating', 'rendering'];

interface ParentImage { file: File; preview: string; }

export default function ChildPredictionPage() {
  const [parent1, setParent1] = useState<ParentImage | null>(null);
  const [parent2, setParent2] = useState<ParentImage | null>(null);
  const [stage,   setStage]   = useState<Stage>('idle');
  const [result,  setResult]  = useState<string | null>(null);
  const [errMsg,  setErrMsg]  = useState<string | null>(null);
  const [drag1,   setDrag1]   = useState(false);
  const [drag2,   setDrag2]   = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const ref1        = useRef<HTMLInputElement>(null);
  const ref2        = useRef<HTMLInputElement>(null);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchAbortRef = useRef<AbortController | null>(null);
  const preview1Ref = useRef<string | null>(null);
  const preview2Ref = useRef<string | null>(null);

  const isLoading = ['analyzing', 'generating', 'rendering'].includes(stage);

  useEffect(() => {
    if (isLoading) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isLoading]);

  // Revoke any remaining preview URLs when the component unmounts
  useEffect(() => {
    return () => {
      if (preview1Ref.current) URL.revokeObjectURL(preview1Ref.current);
      if (preview2Ref.current) URL.revokeObjectURL(preview2Ref.current);
      fetchAbortRef.current?.abort();
    };
  }, []);

  const setParentImg = (file: File, which: 1 | 2) => {
    const preview = URL.createObjectURL(file);
    if (which === 1) {
      setParent1(prev => { if (prev?.preview) URL.revokeObjectURL(prev.preview); preview1Ref.current = preview; return { file, preview }; });
    } else {
      setParent2(prev => { if (prev?.preview) URL.revokeObjectURL(prev.preview); preview2Ref.current = preview; return { file, preview }; });
    }
  };

  const onDrop = useCallback((e: React.DragEvent, which: 1 | 2) => {
    e.preventDefault();
    if (which === 1) setDrag1(false); else setDrag2(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) setParentImg(file, which);
  }, []);

  const handleSubmit = async () => {
    if (!parent1 || !parent2 || isLoading) return;
    setResult(null);
    setErrMsg(null);

    const fd = new FormData();
    fd.append('images', parent1.file);
    fd.append('images', parent2.file);

    const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? '/api/v1').replace(/\/$/, '');

    // Start API call immediately — store abort controller so UI cancel button can abort it
    const fetchAbortCtrl = new AbortController();
    fetchAbortRef.current = fetchAbortCtrl;
    const fetchPromise = fetch(`${apiBase}/features/child-prediction`, {
      method: 'POST',
      body: fd,
      credentials: 'include',
      signal: fetchAbortCtrl.signal,
    });

    // Cycle stages with bounded delays — advance on fetch completion if it finishes early
    setStage('analyzing');
    const abortCtrl = new AbortController();

    const cycleStages = async () => {
      await new Promise(r => setTimeout(r, 20_000));
      if (!abortCtrl.signal.aborted) setStage('generating');
      await new Promise(r => setTimeout(r, 20_000));
      if (!abortCtrl.signal.aborted) setStage('rendering');
    };
    const stagePromise = cycleStages();

    try {
      const res = await fetchPromise;
      abortCtrl.abort(); // stop stage cycling as soon as fetch resolves
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(body.message ?? `خطأ ${res.status}`);
      }
      const data = await res.json() as { image: string };
      setResult(`data:image/jpeg;base64,${data.image}`);
      setStage('done');
    } catch (e: unknown) {
      abortCtrl.abort();
      const msg = e instanceof Error ? e.message : 'خطأ غير متوقع';
      setErrMsg(msg);
      setStage('error');
    }
    await stagePromise.catch(() => {});
  };

  const cancelPrediction = () => {
    fetchAbortRef.current?.abort();
    setStage('error');
    setErrMsg('تم الإلغاء');
  };

  const reset = () => {
    setParent1(prev => { if (prev?.preview) URL.revokeObjectURL(prev.preview); preview1Ref.current = null; return null; });
    setParent2(prev => { if (prev?.preview) URL.revokeObjectURL(prev.preview); preview2Ref.current = null; return null; });
    setResult(null);  setErrMsg(null);
    setStage('idle');
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--muted)]/60 to-white">
      <div className="max-w-xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[var(--muted)] to-[var(--muted)] shadow-lg shadow-black/5 mb-4">
            <span className="text-4xl">👶</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">توقّع شكل طفلكما</h1>
          <p className="text-[var(--muted-foreground)] text-sm leading-relaxed max-w-sm mx-auto">
            ارفع صورتك وصورة شريكك واكتشف كيف سيبدو طفلكما — بتقنية الذكاء الاصطناعي المحلية 💕
          </p>
          <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--muted)] border border-[var(--border)]">
              <svg className="w-3.5 h-3.5 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
              <span className="text-xs text-[var(--primary)] font-medium">خصوصية تامة — لا يُحفظ أي صور</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20">
              <span className="text-xs text-[var(--accent)] font-medium">⏱ يستغرق 2–4 دقائق</span>
            </div>
          </div>
        </div>

        {/* Upload Zones */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {([1, 2] as const).map((which) => {
            const data  = which === 1 ? parent1 : parent2;
            const ref   = which === 1 ? ref1 : ref2;
            const drag  = which === 1 ? drag1 : drag2;
            const label = which === 1 ? 'صورتك' : 'صورة شريكك';
            return (
              <div
                key={which}
                role="button"
                tabIndex={0}
                aria-label={`رفع ${label}`}
                className={[
                  'relative flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2',
                  drag  ? 'border-[var(--ring)] bg-[var(--muted)] scale-[1.02]'
                  : data ? 'border-[var(--border)] bg-[var(--card)]'
                  :        'border-[var(--border)] bg-[var(--muted)]/40 hover:bg-[var(--muted)] hover:border-[var(--border)]',
                ].join(' ')}
                onClick={() => ref.current?.click()}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ref.current?.click(); } }}
                onDrop={(e) => onDrop(e, which)}
                onDragOver={(e) => { e.preventDefault(); if (which === 1) setDrag1(true); else setDrag2(true); }}
                onDragLeave={() => { if (which === 1) setDrag1(false); else setDrag2(false); }}
              >
                <input
                  ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setParentImg(f, which); }}
                />
                {data ? (
                  <>
                    <img src={data.preview} alt={label} className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                      <span className="text-xs bg-black/50 text-white px-2 py-0.5 rounded-full">{label}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 p-4 text-center select-none">
                    <div className="w-14 h-14 rounded-full bg-[var(--card)] shadow-sm flex items-center justify-center text-2xl">👤</div>
                    <p className="font-semibold text-[var(--primary)] text-sm">{label}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">اسحب صورة أو اضغط للرفع</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {(parent1 || parent2) && (
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--destructive)]/20" />
            <span className="text-xl animate-pulse">💕</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--destructive)]/20" />
          </div>
        )}

        {/* Submit / Cancel */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!parent1 || !parent2 || isLoading}
            className="flex-1 h-14 rounded-2xl font-bold text-white text-base transition-all duration-300 shadow-lg shadow-black/5 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-3 bg-gradient-to-l from-[var(--primary)] to-[var(--secondary)] hover:from-[var(--primary-hover)] hover:to-[var(--secondary)] active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>{LABELS[stage] ?? '...'}</span>
                <span className="text-sm font-mono opacity-70">{fmt(elapsed)}</span>
              </>
            ) : (
              <><span className="text-lg">✨</span>اكتشف شكل طفلكما<span className="text-lg">✨</span></>
            )}
          </button>
          {isLoading && (
            <button
              onClick={cancelPrediction}
              className="h-14 px-5 rounded-2xl font-semibold text-[var(--destructive)] border-2 border-[var(--destructive)]/30 bg-[var(--destructive)]/10 hover:bg-[var(--destructive)]/15 transition-colors shrink-0"
            >
              إلغاء
            </button>
          )}
        </div>

        {/* Progress steps */}
        {isLoading && (
          <>
            <div className="mt-4 flex justify-center gap-5 flex-wrap">
              {STEPS.map((s) => (
                <div key={s} className={`flex items-center gap-1.5 text-xs transition-colors duration-500 ${stage === s ? 'text-[var(--primary)] font-semibold' : 'text-[var(--muted-foreground)]/70'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full transition-colors ${stage === s ? 'bg-[var(--primary)] animate-pulse' : 'bg-[var(--muted)]'}`} />
                  {LABELS[s]}
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-[var(--muted-foreground)] mt-3">
              المعالجة تتم محلياً بالكامل — قد تستغرق 2–4 دقائق ⏳
            </p>
          </>
        )}

        {/* Error */}
        {stage === 'error' && (
          <div className="mt-4 p-4 rounded-xl bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 text-[var(--destructive)] text-sm text-center leading-relaxed">
            ⚠️ {errMsg ?? LABELS.error}
          </div>
        )}

        {/* Result */}
        {result && stage === 'done' && (
          <div className="mt-8">
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-[var(--foreground)]">طفلكما المنتظر 🌟</h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">ما شاء الله تبارك الله — صورة توقعية للتسلية</p>
            </div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/5/80 border border-[var(--border)]">
              <img src={result} alt="صورة الطفل المتوقع" className="w-full object-cover" />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent p-4 text-center">
                <p className="text-white text-xs font-medium">بإذن الله 💕</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <a href={result} download="طفلنا.jpg"
                className="h-11 rounded-xl border border-[var(--border)] text-[var(--primary)] font-medium text-sm flex items-center justify-center gap-2 hover:bg-[var(--muted)] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                تنزيل
              </a>
              <button onClick={reset}
                className="h-11 rounded-xl bg-[var(--primary)] text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-[var(--primary)] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                جرّب مجدداً
              </button>
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              <a
                href={`https://wa.me/?text=${encodeURIComponent('شاهد كيف سيبدو طفلي 👶💕 جرّب الآن على طيبت: https://tayyibt.com/child-prediction')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold bg-[#25D366] text-white hover:opacity-90 transition-opacity"
              >
                📲 شارك عبر واتساب
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent('https://tayyibt.com/child-prediction')}&text=${encodeURIComponent('شاهد كيف سيبدو طفلي 👶💕 جرّب الآن على طيبت!')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold bg-[#229ED9] text-white hover:opacity-90 transition-opacity"
              >
                ✈️ تليجرام
              </a>
            </div>
          </div>
        )}

        {/* Privacy */}
        <div className="mt-8 p-4 rounded-2xl bg-[var(--muted)]/80 border border-[var(--border)]">
          <p className="text-xs font-bold text-[var(--muted-foreground)] mb-2">🛡️ سياسة الخصوصية</p>
          <ul className="text-xs text-[var(--muted-foreground)] space-y-1 leading-relaxed">
            <li>• المعالجة تتم كلياً في الذاكرة المؤقتة داخل الخادم</li>
            <li>• لا تُحفظ صورك أو نتيجة التوليد على أي قرص صلب</li>
            <li>• الصور تُمسح فور إرجاع النتيجة للمستخدم</li>
            <li>• هذه الميزة للتسلية والترفيه فقط — ليست توقعاً علمياً</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
