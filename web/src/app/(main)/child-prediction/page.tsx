'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAppOrigin } from '@/lib/app-url';
import {
  Baby, Sparkle, Heart, ShieldCheck, Camera, X, Star,
  ArrowClockwise, DownloadSimple, WhatsappLogo, TelegramLogo, MagicWand,
} from '@phosphor-icons/react';

type Stage = 'idle' | 'analyzing' | 'generating' | 'rendering' | 'done' | 'error';

const LABELS: Record<string, string> = {
  analyzing:  'الذكاء الاصطناعي يحلل ملامح الوجوه...',
  generating: 'يبني توقّع ملامح الطفل...',
  rendering:  'يرسم صورة الطفل...',
  done:       'اكتمل! ✨',
  error:      'حدث خطأ، يرجى المحاولة مجدداً',
};

const STEPS: { key: Stage; short: string }[] = [
  { key: 'analyzing',  short: 'تحليل الملامح' },
  { key: 'generating', short: 'مزج الوراثة' },
  { key: 'rendering',  short: 'رسم الصورة' },
];

interface ParentImage { file: File; preview: string; }

export default function ChildPredictionPage() {
  const [parent1, setParent1] = useState<ParentImage | null>(null);
  const [parent2, setParent2] = useState<ParentImage | null>(null);
  const [stage,   setStage]   = useState<Stage>('idle');
  const [result,  setResult]  = useState<string | null>(null);
  const [resultMediaUrl, setResultMediaUrl] = useState<string | null>(null);
  const [errMsg,  setErrMsg]  = useState<string | null>(null);
  const [drag1,   setDrag1]   = useState(false);
  const [drag2,   setDrag2]   = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const appOrigin = useAppOrigin();
  // Share the specific generated result once it exists (server-persisted with
  // a token-signed permalink), not the tool's own homepage (#86).
  const shareUrl = resultMediaUrl ? `${appOrigin}${resultMediaUrl}` : `${appOrigin}/child-prediction`;
  const shareText = 'شاهد كيف سيبدو طفلي 👶💕 جرّب الآن على طيبت';

  const ref1        = useRef<HTMLInputElement>(null);
  const ref2        = useRef<HTMLInputElement>(null);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchAbortRef = useRef<AbortController | null>(null);
  const preview1Ref = useRef<string | null>(null);
  const preview2Ref = useRef<string | null>(null);

  const isLoading = ['analyzing', 'generating', 'rendering'].includes(stage);
  const bothReady = !!(parent1 && parent2);

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

  const clearParent = (which: 1 | 2) => {
    if (which === 1) setParent1(prev => { if (prev?.preview) URL.revokeObjectURL(prev.preview); preview1Ref.current = null; return null; });
    else             setParent2(prev => { if (prev?.preview) URL.revokeObjectURL(prev.preview); preview2Ref.current = null; return null; });
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
    setResultMediaUrl(null);
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
      const data = await res.json() as { image: string; mediaUrl?: string | null };
      setResult(`data:image/jpeg;base64,${data.image}`);
      setResultMediaUrl(data.mediaUrl ?? null);
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
    clearParent(1);
    clearParent(2);
    setResult(null);  setErrMsg(null);
    setStage('idle');
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  /* ── Upload zone (one parent) ── */
  const renderZone = (which: 1 | 2) => {
    const data  = which === 1 ? parent1 : parent2;
    const ref   = which === 1 ? ref1 : ref2;
    const drag  = which === 1 ? drag1 : drag2;
    const label = which === 1 ? 'صورتك' : 'صورة شريكك';
    return (
      <div className="group relative">
        <div
          role="button"
          tabIndex={0}
          aria-label={`رفع ${label}`}
          className={[
            'relative flex flex-col items-center justify-center aspect-square rounded-[1.4rem] cursor-pointer overflow-hidden',
            'transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2',
            'border-2',
            drag  ? 'scale-[1.03] border-[var(--accent)]'
            : data ? 'border-[var(--border)] shadow-[0_8px_24px_color-mix(in_srgb,var(--primary)_14%,transparent)]'
            :        'border-dashed border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] hover:-translate-y-0.5',
          ].join(' ')}
          style={{ background: data ? 'var(--card)' : 'color-mix(in srgb, var(--accent) 6%, var(--card))' }}
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
              <div className="absolute inset-x-0 bottom-0 p-2 flex justify-center"
                   style={{ background: 'linear-gradient(to top, color-mix(in srgb, var(--primary) 80%, transparent), transparent)' }}>
                <span className="text-[11px] font-bold text-white">{label}</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 p-3 text-center select-none">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                   style={{ background: 'color-mix(in srgb, var(--accent) 14%, var(--card))', color: 'var(--accent)' }}>
                <Camera size={22} weight="duotone" />
              </div>
              <p className="font-bold text-[var(--primary)] text-sm">{label}</p>
              <p className="text-[11px] text-[var(--muted-foreground)] leading-snug">اسحب صورة<br />أو اضغط للرفع</p>
            </div>
          )}
        </div>
        {/* Replace / remove control once a photo is chosen */}
        {data && (
          <button
            onClick={() => clearParent(which)}
            aria-label={`إزالة ${label}`}
            className="absolute -top-2 -left-2 z-10 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110"
            style={{ background: 'var(--card)', color: 'var(--destructive)', border: '1px solid var(--border)' }}
          >
            <X size={14} weight="bold" />
          </button>
        )}
      </div>
    );
  };

  /* ── Central fusion orb — the creative heart of the page ── */
  const fusionOrb = (
    <div className="relative flex items-center justify-center w-14 sm:w-20 shrink-0" aria-hidden>
      {/* soft aura */}
      <div
        className={`absolute w-16 sm:w-24 h-16 sm:h-24 rounded-full blur-xl transition-opacity duration-500 ${bothReady ? 'opacity-80 animate-pulse-soft' : 'opacity-30'}`}
        style={{ background: 'radial-gradient(circle, var(--accent), transparent 70%)' }}
      />
      {/* ripple rings when ready */}
      {bothReady && !result && (
        <>
          <span className="absolute w-12 sm:w-16 h-12 sm:h-16 rounded-full border" style={{ borderColor: 'color-mix(in srgb, var(--accent) 50%, transparent)', animation: 'ripple 2.4s ease-out infinite' }} />
          <span className="absolute w-12 sm:w-16 h-12 sm:h-16 rounded-full border" style={{ borderColor: 'color-mix(in srgb, var(--accent) 50%, transparent)', animation: 'ripple 2.4s ease-out infinite 1.2s' }} />
        </>
      )}
      {/* core orb */}
      <div
        className={`relative z-10 w-11 sm:w-14 h-11 sm:h-14 rounded-full flex items-center justify-center text-white shadow-lg ${isLoading ? 'animate-float' : ''}`}
        style={{
          background: bothReady
            ? 'linear-gradient(135deg, var(--secondary), var(--accent))'
            : 'linear-gradient(135deg, var(--primary), var(--secondary))',
          boxShadow: bothReady ? '0 0 22px color-mix(in srgb, var(--accent) 55%, transparent)' : '0 6px 16px color-mix(in srgb, var(--primary) 30%, transparent)',
        }}
      >
        <Heart size={bothReady ? 22 : 20} weight="fill" className={bothReady ? 'animate-pulse' : 'opacity-80'} />
      </div>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-6 animate-fade-in">

      {/* Luxury page header — shared system component */}
      <PageHeader
        icon={Baby}
        eyebrow="ميزة ترفيهية بالذكاء الاصطناعي"
        title="توقّع شكل طفلكما"
        subtitle="امزج ملامحكما واكتشف وجه المستقبل 💕"
        action={
          <div className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5"
               style={{ background: 'rgba(255,255,255,0.12)' }}>
            <Sparkle size={14} weight="fill" className="text-white" />
            <span className="text-[11px] font-bold text-white">معالجة محلية</span>
          </div>
        }
      />

      {/* trust chips */}
      <div className="flex items-center justify-center gap-2 mt-4 mb-7 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
              style={{ background: 'color-mix(in srgb, var(--primary) 8%, var(--card))', color: 'var(--primary)', border: '1px solid var(--border)' }}>
          <ShieldCheck size={14} weight="fill" /> خصوصية تامة — لا تُحفظ الصور
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
              style={{ background: 'color-mix(in srgb, var(--accent) 12%, var(--card))', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)' }}>
          ⏱ 2–4 دقائق
        </span>
      </div>

      {/* Fusion chamber: parent ▸ orb ◂ parent */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3 mb-6">
        {renderZone(1)}
        {fusionOrb}
        {renderZone(2)}
      </div>

      {/* Primary action */}
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={!bothReady || isLoading}
          className="relative flex-1 h-14 rounded-2xl font-bold text-white text-base overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2.5"
          style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 55%, var(--accent) 100%)',
            boxShadow: bothReady && !isLoading ? '0 10px 28px color-mix(in srgb, var(--accent) 35%, transparent)' : 'none',
          }}
        >
          {/* gold shimmer sweep when actionable */}
          {bothReady && !isLoading && (
            <span className="absolute inset-0 -translate-x-full animate-shimmer"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }} />
          )}
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="relative z-10 truncate">{LABELS[stage] ?? '...'}</span>
              <span className="relative z-10 text-sm font-mono opacity-70">{fmt(elapsed)}</span>
            </>
          ) : (
            <span className="relative z-10 flex items-center gap-2.5">
              <MagicWand size={20} weight="fill" />
              اكتشف شكل طفلكما
              <Sparkle size={18} weight="fill" />
            </span>
          )}
        </button>
        {isLoading && (
          <button
            onClick={cancelPrediction}
            className="h-14 px-5 rounded-2xl font-semibold transition-colors shrink-0"
            style={{ color: 'var(--destructive)', background: 'color-mix(in srgb, var(--destructive) 10%, transparent)', border: '2px solid color-mix(in srgb, var(--destructive) 30%, transparent)' }}
          >
            إلغاء
          </button>
        )}
      </div>

      {/* Processing ritual — connected timeline */}
      {isLoading && (
        <div className="mt-6 rounded-2xl p-5"
             style={{ background: 'color-mix(in srgb, var(--primary) 5%, var(--card))', border: '1px solid var(--border)' }}>
          <div className="flex items-start justify-between">
            {STEPS.map((s, i) => {
              const activeIdx = STEPS.findIndex(st => st.key === stage);
              const isActive = stage === s.key;
              const isDone = i < activeIdx;
              return (
                <div key={s.key} className="flex-1 flex flex-col items-center relative">
                  {/* connector */}
                  {i < STEPS.length - 1 && (
                    <span className="absolute top-3 right-1/2 w-full h-0.5 -z-0"
                          style={{ background: isDone ? 'var(--accent)' : 'var(--border)' }} />
                  )}
                  <div className="relative z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500"
                       style={{
                         background: isActive ? 'var(--accent)' : isDone ? 'var(--secondary)' : 'var(--muted)',
                         boxShadow: isActive ? '0 0 0 5px color-mix(in srgb, var(--accent) 18%, transparent)' : 'none',
                       }}>
                    {isDone
                      ? <Sparkle size={12} weight="fill" className="text-white" />
                      : <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-[var(--muted-foreground)]'}`} />}
                  </div>
                  <span className={`mt-2 text-[11px] text-center transition-colors ${isActive ? 'font-bold text-[var(--primary)]' : isDone ? 'text-[var(--secondary)]' : 'text-[var(--muted-foreground)]'}`}>
                    {s.short}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-center text-[11px] text-[var(--muted-foreground)] mt-4 leading-relaxed">
            {LABELS[stage]}<br />المعالجة تتم محلياً بالكامل داخل الخادم ⏳
          </p>
        </div>
      )}

      {/* Error */}
      {stage === 'error' && (
        <div className="mt-5 p-4 rounded-2xl text-sm text-center leading-relaxed"
             style={{ background: 'color-mix(in srgb, var(--destructive) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--destructive) 22%, transparent)', color: 'var(--destructive)' }}>
          ⚠️ {errMsg ?? LABELS.error}
        </div>
      )}

      {/* Result reveal */}
      {result && stage === 'done' && (
        <div className="mt-8 animate-scale-in">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-1.5 mb-2 px-3 py-1 rounded-full"
                 style={{ background: 'color-mix(in srgb, var(--accent) 14%, var(--card))', color: 'var(--accent)' }}>
              <Star size={13} weight="fill" />
              <span className="text-[11px] font-bold">النتيجة جاهزة</span>
            </div>
            <h2 className="text-lg font-extrabold text-[var(--foreground)]">طفلكما المنتظر 🌟</h2>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">ما شاء الله تبارك الله — صورة توقعية للتسلية</p>
          </div>

          {/* gold-framed portrait */}
          <div className="relative rounded-[1.6rem] p-1"
               style={{ background: 'linear-gradient(135deg, var(--accent), var(--secondary))', boxShadow: '0 16px 40px color-mix(in srgb, var(--primary) 24%, transparent)' }}>
            <div className="relative rounded-[1.4rem] overflow-hidden" style={{ background: 'var(--card)' }}>
              <img src={result} alt="صورة الطفل المتوقع" className="w-full object-cover" />
              <div className="absolute bottom-0 inset-x-0 p-4 text-center"
                   style={{ background: 'linear-gradient(to top, color-mix(in srgb, var(--primary) 75%, transparent), transparent)' }}>
                <p className="text-white text-xs font-bold flex items-center justify-center gap-1.5">
                  <Heart size={13} weight="fill" /> بإذن الله
                </p>
              </div>
            </div>
          </div>

          {/* actions */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <a href={result} download="طفلنا.jpg"
               className="h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
               style={{ color: 'var(--primary)', border: '1px solid var(--border)', background: 'var(--card)' }}>
              <DownloadSimple size={17} weight="bold" /> تنزيل
            </a>
            <button onClick={reset}
              className="h-11 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
              style={{ background: 'var(--primary)' }}>
              <ArrowClockwise size={17} weight="bold" /> جرّب مجدداً
            </button>
          </div>

          {/* share */}
          <div className="mt-3 flex gap-2 flex-wrap">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${shareText}: ${shareUrl}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: '#25D366' }}
            >
              <WhatsappLogo size={18} weight="fill" /> واتساب
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText + '!')}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: '#229ED9' }}
            >
              <TelegramLogo size={18} weight="fill" /> تليجرام
            </a>
          </div>
        </div>
      )}

      {/* Privacy */}
      <div className="mt-8 rounded-2xl p-4"
           style={{ background: 'color-mix(in srgb, var(--primary) 4%, var(--card))', border: '1px solid var(--border)' }}>
        <p className="text-xs font-bold text-[var(--primary)] mb-2 flex items-center gap-1.5">
          <ShieldCheck size={15} weight="fill" style={{ color: 'var(--accent)' }} /> سياسة الخصوصية
        </p>
        <ul className="text-[11px] text-[var(--muted-foreground)] space-y-1 leading-relaxed">
          <li>• المعالجة تتم كلياً في الذاكرة المؤقتة داخل الخادم</li>
          <li>• لا تُحفظ صورك أو نتيجة التوليد على أي قرص صلب</li>
          <li>• الصور تُمسح فور إرجاع النتيجة للمستخدم</li>
          <li>• هذه الميزة للتسلية والترفيه فقط — ليست توقعاً علمياً</li>
        </ul>
      </div>

    </div>
  );
}
