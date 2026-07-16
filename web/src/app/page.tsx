'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useReducedMotion,
  animate,
} from 'framer-motion';
import type { Variants } from 'framer-motion';
import * as stylex from '@stylexjs/stylex';

// ── shadcn/ui primitives (cva + Radix Slot) ──────────────────────
import { Button } from '@/components/landing/Button';
import { Card, CardContent, CardTitle } from '@/components/landing/Card';
import { Badge } from '@/components/landing/Badge';
// ── StyleX style objects (compiled by @stylexjs/postcss-plugin) ───
import { sx } from '@/components/landing/lux.stylex';
// ── Panda CSS (styled-system generated via `panda cssgen`) ────────
import { css } from '../../styled-system/css';

/* ── Luxury "Emerald Sanctum" palette ─────────────────────────── */
const C = {
  forest: '#0A3D2B',
  forestDeep: '#091F16',
  emerald: '#1A6B4A',
  gold: '#B8892A',
  goldLight: '#E8C57A',
  parchment: '#F4EFE4',
  card: '#FDFAF3',
  ink: '#0E1912',
  muted: '#66756A',
  border: '#DDD5BF',
};
const serif = "'Noto Serif Arabic', serif";

/* ── Panda CSS: a styled eyebrow rule via css() ───────────────── */
const eyebrowRule = css({
  display: 'inline-block',
  height: '2px',
  width: '34px',
  borderRadius: '9999px',
  backgroundColor: '#B8892A',
  verticalAlign: 'middle',
  marginInline: '2',
});

/* ── Icons ────────────────────────────────────────────────────── */
const Icons = {
  heart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
  sparkles: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0zm-13.5 0a2.625 2.625 0 11-5.25 0 2.625 2.625 0 014.5 0z" /></svg>,
  lock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>,
  chat: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>,
  chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>,
  arrow: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>,
  star: <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" /></svg>,
};

const Images = {
  couple1: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&q=80',
  couple2: 'https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=600&q=80',
  couple3: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&q=80',
  hands: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=600&q=80',
  profile1: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
  profile2: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
  profile3: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
};

/* ── Islamic geometric pattern (decorative overlay) ───────────── */
const ARABESQUE = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><g fill='none' stroke='${C.goldLight}' stroke-width='1'><path d='M30 0l8 22 22 8-22 8-8 22-8-22-22-8 22-8z'/><circle cx='30' cy='30' r='6'/></g></svg>`,
);
const patternStyle: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,${ARABESQUE}")`,
  backgroundSize: '60px 60px',
};

/* ── framer-motion helpers ────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1] as const;

function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

function Counter({ to, suffix = '', prefix = '' }: { to: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [val, setVal] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!inView) return;
    if (reduce) { setVal(to); return; }
    const controls = animate(0, to, { duration: 1.8, ease: 'easeOut', onUpdate: (v) => setVal(Math.floor(v)) });
    return () => controls.stop();
  }, [inView, to, reduce]);
  return <span ref={ref}>{prefix}{val.toLocaleString('en-US')}{suffix}</span>;
}

/* Shared section eyebrow — Panda css() rule + StyleX gold underline. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  // The eyebrow label text used C.gold (#B8892A) directly as a foreground
  // color over the parchment/card section backgrounds it sits on -- only
  // ~2.75:1 contrast (fails WCAG AA, reads as "blends into the background"),
  // unlike every other title in this file which uses C.forest for readable
  // text and reserves gold for decoration/accents (icons, underlines,
  // borders) (#392). The underline bars stay gold since they're decorative.
  return (
    <div className="mb-3">
      <p className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: C.forest }}>
        <span className={eyebrowRule} />
        {children}
        <span className={eyebrowRule} />
      </p>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  // Before scrolling the nav is transparent, floating directly over the
  // hero's dark forest-green gradient -- but its text used the same dark
  // forest color meant for the light parchment background further down,
  // so nav and hero visually merged into one dark-on-dark block (#309).
  const navTextColor = scrolled ? C.forest : C.card;
  const heroRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  // Gate client-only motion + the video embed so the first client render matches
  // the server HTML exactly (fixes the React #418/#425 hydration mismatch that
  // came from rendering reduced-motion-dependent elements only on the server).
  const [mounted, setMounted] = useState(false);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const floatA = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -90]);
  const floatB = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 70]);
  const heroFade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <main className="overflow-x-hidden" style={{ background: C.parchment, color: C.ink }}>
      <style>{`
        @keyframes lux-shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        .lux-gold-text {
          background: linear-gradient(110deg, ${C.gold} 20%, ${C.goldLight} 40%, #FFF4D6 50%, ${C.goldLight} 60%, ${C.gold} 80%);
          background-size: 200% auto;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; color: transparent;
          animation: lux-shimmer 6s linear infinite;
        }
        .lux-shine { position: relative; overflow: hidden; }
        .lux-shine::after {
          content:''; position:absolute; inset:0; transform: translateX(-130%);
          background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,.45) 50%, transparent 70%);
        }
        .lux-shine:hover::after { transition: transform .9s ease; transform: translateX(130%); }
        @media (prefers-reduced-motion: reduce) { .lux-gold-text { animation: none } }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="fixed inset-x-0 top-0 z-50"
        style={{
          background: scrolled ? 'rgba(244,239,228,0.82)' : 'transparent',
          backdropFilter: scrolled ? 'blur(18px)' : 'none',
          borderBottom: scrolled ? `1px solid ${C.border}` : '1px solid transparent',
          transition: 'background .3s ease, border-color .3s ease, backdrop-filter .3s ease',
        }}
      >
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-base font-bold" style={{ background: `linear-gradient(135deg, ${C.forest}, ${C.emerald})`, color: C.goldLight, boxShadow: `0 6px 18px -6px ${C.forest}` }}>ط</div>
            <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: serif, color: navTextColor, transition: 'color .3s ease' }}>طيبت</span>
          </div>
          <div className="hidden items-center gap-9 text-sm font-semibold sm:flex">
            {[['المميزات', '#features'], ['كيف يعمل', '#how'], ['قصص النجاح', '#stories']].map(([label, href]) => (
              <a key={href} href={href} className="group relative py-1 transition-colors" style={{ color: navTextColor }}>
                {label}
                <span className="absolute inset-x-0 -bottom-0.5 h-0.5 origin-right scale-x-0 transition-transform duration-300 group-hover:scale-x-100" style={{ background: C.gold }} />
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/login" className="flex h-10 items-center rounded-2xl px-4 text-sm font-semibold transition-colors hover:opacity-70" style={{ color: navTextColor, transition: 'color .3s ease' }}>
              تسجيل الدخول
            </Link>
            {/* shadcn/ui Button */}
            <Button asChild variant="forest" size="sm" className="lux-shine">
              <Link href="/register">انضم مجاناً</Link>
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="relative rounded-[2rem] sm:rounded-[2.75rem]">
          {/* Background layer — clips the video + decoration. The OUTER panel is
              overflow-visible so the floating visual can hang below the video. */}
          <div aria-hidden className="absolute inset-0 overflow-hidden rounded-[2rem] sm:rounded-[2.75rem]" style={{ background: `linear-gradient(160deg, ${C.forestDeep} 0%, ${C.forest} 55%, ${C.emerald} 130%)` }}>
            {/* Dark tint for text legibility over the gradient background */}
            <div aria-hidden className="absolute inset-0" style={{ background: `linear-gradient(105deg, ${C.forestDeep}f2 0%, ${C.forestDeep}c2 45%, ${C.forest}82 100%)` }} />
            {/* Aurora glows — always in the DOM (identical on server + first client
                render); animation starts only after mount. */}
            <motion.div aria-hidden className="pointer-events-none absolute -top-24 right-[-10%] h-[28rem] w-[28rem] rounded-full" style={{ background: `radial-gradient(circle, ${C.gold}55, transparent 65%)`, filter: 'blur(20px)' }} animate={mounted && !reduce ? { x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.12, 1] } : undefined} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }} />
            <motion.div aria-hidden className="pointer-events-none absolute bottom-[-15%] left-[-10%] h-[30rem] w-[30rem] rounded-full" style={{ background: `radial-gradient(circle, ${C.emerald}88, transparent 65%)`, filter: 'blur(24px)' }} animate={mounted && !reduce ? { x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.15, 1] } : undefined} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06]" style={patternStyle} />
            <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse at 70% 0%, transparent 40%, ${C.forestDeep}66 100%)` }} />
          </div>

          <motion.div style={{ opacity: heroFade }} className="relative mx-auto max-w-6xl px-5 pb-20 pt-28 sm:px-8 sm:pb-28 sm:pt-36">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <motion.div variants={stagger} initial="hidden" animate="show" className="text-center lg:text-right">
                <motion.div variants={item} className="mb-7 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold" style={{ background: 'rgba(184,137,42,0.14)', color: C.goldLight, border: `1px solid ${C.gold}55` }}>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70" style={{ background: C.goldLight }} />
                    <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: C.goldLight }} />
                  </span>
                  منصة التعارف والزواج الإسلامي
                </motion.div>

                <motion.h1 variants={item} className="mb-6 text-4xl font-bold leading-[1.18] sm:text-5xl lg:text-[3.6rem]" style={{ fontFamily: serif, color: C.parchment }}>
                  ابحث عن شريك
                  <br />
                  <span className="lux-gold-text">حياتك المثالي</span>
                </motion.h1>

                <motion.p variants={item} className="mx-auto mb-10 max-w-xl text-lg leading-relaxed lg:mx-0" style={{ color: '#CFE0D4' }}>
                  منصة طيبت تجمع بين الذكاء الاصطناعي والقيم الإسلامية لمساعدتك في إيجاد شريك الحياة المناسب — بأمان وخصوصية تامة.
                </motion.p>

                <motion.div variants={item} className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                  {/* shadcn/ui Buttons */}
                  <Button asChild variant="gold" size="lg" className="lux-shine w-full sm:w-auto">
                    <Link href="/register">ابدأ رحلتك مجاناً</Link>
                  </Button>
                  <Button asChild variant="ghostLight" size="lg" className="w-full sm:w-auto">
                    <Link href="#how">شاهد كيف يعمل</Link>
                  </Button>
                </motion.div>

                <motion.div variants={item} className="mt-12 flex items-center justify-center gap-5 lg:justify-start">
                  <div className="flex -space-x-2 space-x-reverse">
                    {[Images.profile1, Images.profile2, Images.profile3].map((src, i) => (
                      <img key={i} src={src} alt="" className="h-10 w-10 rounded-full border-2 object-cover" style={{ borderColor: C.forest }} />
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-0.5" style={{ color: C.goldLight }}>
                      {[0, 1, 2, 3, 4].map((i) => <span key={i}>{Icons.star}</span>)}
                    </div>
                    <p className="text-xs" style={{ color: '#CFE0D4' }}>4.9/5 من +2,000 تقييم</p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Floating visual — pushed down so it sits half over the video and
                  half below it (overflows the panel since it is overflow-visible). */}
              <div className="relative z-20 hidden lg:block lg:translate-y-28">
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.2 }} className="relative mx-auto w-full max-w-md">
                  <div className="overflow-hidden rounded-[1.75rem] shadow-2xl" style={{ border: `5px solid ${C.card}` }}>
                    <img src={Images.couple1} alt="زوجان سعيدان" className="h-[22rem] w-full object-cover" />
                  </div>
                  <motion.div style={{ y: floatA }} className="absolute -top-6 -left-10 h-28 w-28 overflow-hidden rounded-2xl shadow-xl">
                    <img src={Images.couple2} alt="" className="h-full w-full object-cover" style={{ border: `3px solid ${C.card}` }} />
                  </motion.div>
                  <motion.div style={{ y: floatB }} className="absolute -bottom-6 -right-10 h-32 w-32 overflow-hidden rounded-2xl shadow-xl">
                    <img src={Images.hands} alt="" className="h-full w-full object-cover" style={{ border: `3px solid ${C.card}` }} />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7, duration: 0.6 }} className="absolute -top-7 -right-6 rounded-2xl p-3.5 shadow-2xl" style={{ background: 'rgba(253,250,243,0.92)', backdropFilter: 'blur(8px)', border: `1px solid ${C.gold}44` }}>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: `${C.gold}22`, color: C.gold }}>{Icons.heart}</div>
                      <div>
                        <p className="text-xs font-bold" style={{ color: C.forest }}>توافق جديد!</p>
                        <p className="text-[10px] font-semibold" style={{ color: C.gold }}>95% توافق</p>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9, duration: 0.6 }} className="absolute -bottom-7 -left-6 rounded-2xl p-3.5 shadow-2xl" style={{ background: 'rgba(253,250,243,0.92)', backdropFilter: 'blur(8px)', border: `1px solid ${C.gold}44` }}>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: `${C.emerald}1f`, color: C.emerald }}>{Icons.shield}</div>
                      <div>
                        <p className="text-xs font-bold" style={{ color: C.forest }}>حلال</p>
                        <p className="text-[10px]" style={{ color: C.muted }}>بيئة آمنة</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS — daisyUI `stats` component (scoped theme) ──── */}
      {/* Extra top padding on lg leaves room for the hero visual that overhangs. */}
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-20 sm:px-6 sm:pb-20 lg:pt-40">
        <Reveal>
          <div data-theme="tayyibt" className="rounded-[1.75rem]" style={{ background: 'transparent' }}>
            <div className="stats stats-vertical w-full border sm:stats-horizontal" style={{ background: C.card, borderColor: C.border, boxShadow: '0 8px 30px -12px rgba(10,61,43,0.15)' }}>
              {[
                { value: 2000, suffix: '+', label: 'عضو نشط', icon: Icons.users },
                { value: 96, suffix: '%', label: 'دقة التوافق', icon: Icons.sparkles },
                { value: 150, suffix: '+', label: 'حالة زواج', icon: Icons.heart },
                { value: 24, suffix: '/7', label: 'دعم متواصل', icon: Icons.shield },
              ].map((s) => (
                <div key={s.label} className="stat place-items-center text-center">
                  <div className="stat-figure" style={{ color: C.gold }}>{s.icon}</div>
                  <div className="stat-value text-3xl sm:text-4xl" style={{ fontFamily: serif, color: C.forest }}>
                    <Counter to={s.value} suffix={s.suffix} />
                  </div>
                  <div className="stat-desc mt-1 text-sm" style={{ color: C.muted }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FEATURES — shadcn/ui Card ───────────────────────── */}
      <section id="features" className="py-20 sm:py-24" style={{ background: `linear-gradient(180deg, ${C.parchment}, ${C.card})` }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mb-14 text-center">
            <Eyebrow>لماذا طيبت؟</Eyebrow>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl" style={{ fontFamily: serif, color: C.forest }}>تجربة زواج آمنة وذكية</h2>
            <p className="mx-auto max-w-2xl text-lg" style={{ color: C.muted }}>نقدم لك منصة متكاملة تجمع بين التكنولوجيا الحديثة والقيم الإسلامية الأصيلة</p>
          </Reveal>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Icons.sparkles, title: 'توافق بالذكاء الاصطناعي', desc: 'خوارزميات متقدمة تراعي القيم الدينية والثقافية والاجتماعية لإيجاد الشريك المثالي' },
              { icon: Icons.lock, title: 'خصوصية وأمان', desc: 'بياناتك محمية بأعلى معايير الأمان مع التحكم الكامل في من يرى ملفك الشخصي' },
              { icon: Icons.users, title: 'إشراف أهلي', desc: 'إمكانية إشراك أولياء الأمور في عملية البحث والموافقة لضمان التوافق العائلي' },
              { icon: Icons.chat, title: 'محادثات آمنة', desc: 'تواصل آمن مع مرشحي التوافق مع إمكانية مراقبة المحادثات وفق الضوابط الشرعية' },
              { icon: Icons.chart, title: 'تقارير معمقة', desc: 'تحليلات تفصيلية لدرجات التوافق في مختلف الجوانب الدينية والثقافية والاجتماعية' },
              { icon: Icons.shield, title: 'ملتزم بالضوابط', desc: 'كل شيء مصمم وفق الضوابط الشرعية الإسلامية لضمان تجربة زواج حلال' },
            ].map((f) => (
              <motion.div key={f.title} variants={item} whileHover={{ y: -6 }}>
                <Card className="group relative h-full overflow-hidden">
                  <CardContent>
                    <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(circle, ${C.gold}22, transparent 70%)` }} />
                    <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110" style={{ background: `linear-gradient(135deg, ${C.forest}, ${C.emerald})`, color: C.goldLight }}>{f.icon}</div>
                    <CardTitle className="mb-2">{f.title}</CardTitle>
                    <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS — Flowbite timeline ────────────────── */}
      <section id="how" className="py-20 sm:py-24" style={{ background: C.parchment }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <Reveal>
                <Eyebrow>خطوات بسيطة</Eyebrow>
                <h2 className="mb-10 text-3xl font-bold sm:text-4xl" style={{ fontFamily: serif, color: C.forest }}>كيف يعمل طيبت؟</h2>
              </Reveal>
              {/* Flowbite timeline component */}
              <ol className="relative border-s-2" style={{ borderColor: C.border }}>
                {[
                  { step: '01', title: 'أنشئ ملفك الشخصي', desc: 'سجل واملأ ملفك ببياناتك وتفضيلاتك في أقل من 5 دقائق' },
                  { step: '02', title: 'احصل على توصيات ذكية', desc: 'الذكاء الاصطناعي يحلل ويقترح أفضل المرشحين المتوافقين معك' },
                  { step: '03', title: 'تواصل في بيئة آمنة', desc: 'تحدث مع مرشحي التوافق وابدأ رحلتك نحو الزواج بنجاح' },
                ].map((s, i) => (
                  <li key={s.step} className="mb-10 ms-8 last:mb-0">
                    <Reveal delay={i * 0.12}>
                      <span className="absolute -start-[1.4rem] flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold ring-8" style={{ fontFamily: serif, background: C.card, color: C.gold, border: `1.5px solid ${C.gold}66`, boxShadow: '0 4px 14px -6px rgba(184,137,42,.5)', '--tw-ring-color': C.parchment } as React.CSSProperties}>
                        {s.step}
                      </span>
                      <h3 className="mb-1 text-lg font-bold" style={{ color: C.forest }}>{s.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{s.desc}</p>
                    </Reveal>
                  </li>
                ))}
              </ol>
            </div>

            <Reveal y={40} className="hidden lg:block">
              <div className="relative overflow-hidden rounded-[1.75rem] shadow-2xl" style={{ border: `5px solid ${C.card}` }}>
                <img src={Images.couple3} alt="زوجان" className="h-[26rem] w-full object-cover" />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${C.forestDeep}cc, transparent 55%)` }} />
                <div className="absolute inset-x-6 bottom-6">
                  <div className="rounded-2xl p-4" style={{ background: 'rgba(253,250,243,0.95)', backdropFilter: 'blur(8px)', border: `1px solid ${C.gold}33` }}>
                    <div className="flex items-center gap-3">
                      <img src={Images.profile2} alt="" className="h-10 w-10 rounded-full object-cover" />
                      <div>
                        <p className="text-sm font-bold" style={{ color: C.forest }}>وجدت توافقي خلال أسبوع!</p>
                        <div className="flex items-center gap-0.5" style={{ color: C.gold }}>
                          {[0, 1, 2, 3, 4].map((i) => <span key={i} className="h-3.5 w-3.5">{Icons.star}</span>)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── STORIES — shadcn/ui Card + Badge ────────────────── */}
      <section id="stories" className="py-20 sm:py-24" style={{ background: `linear-gradient(180deg, ${C.card}, ${C.parchment})` }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mb-14 text-center">
            <Eyebrow>قصص حقيقية</Eyebrow>
            <h2 className="text-3xl font-bold sm:text-4xl" style={{ fontFamily: serif, color: C.forest }}>نجاحات طيبت</h2>
          </Reveal>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { names: 'أحمد & فاطمة', text: 'الحمد لله وجدت نصيبي في طيبت. التوافق كان ممتاز والقيم كانت مشتركة بشكل مذهل. أنصح الجميع بالتجربة.', city: 'القاهرة', match: '96%', img: Images.couple1 },
              { names: 'يوسف & مريم', text: 'تجربة رائعة من البداية للنهاية. الخصوصية والأمان اللي توفرها المنصة خلتني أرتاح تماماً.', city: 'جدة', match: '92%', img: Images.couple2 },
              { names: 'علي & نور', text: 'طريقة التوافق بالذكاء الاصطناعي كانت دقيقة ومبنية على أسس صحيحة. الحمد لله وجدت شريكة حياتي.', city: 'دبي', match: '94%', img: Images.couple3 },
            ].map((s) => (
              <motion.div key={s.names} variants={item} whileHover={{ y: -6 }}>
                <Card className="h-full overflow-hidden">
                  <div className="relative h-44 overflow-hidden">
                    <img src={s.img} alt="" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                    <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${C.forestDeep}aa, transparent 60%)` }} />
                    <Badge variant="gold" className="absolute bottom-3 right-3">{Icons.check} توافق {s.match}</Badge>
                  </div>
                  <CardContent className="p-6">
                    <p className="mb-4 text-sm leading-relaxed" style={{ color: C.ink }}>”{s.text}“</p>
                    <div className="flex items-center gap-3 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold" style={{ background: `${C.forest}14`, color: C.forest }}>{s.names[0]}</div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: C.forest }}>{s.names}</p>
                        <p className="text-xs" style={{ color: C.muted }}>{s.city}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="px-3 pb-4 sm:px-4">
        <Reveal y={40}>
          <div className="relative overflow-hidden rounded-[2rem] px-6 py-20 text-center sm:rounded-[2.5rem] sm:py-24" style={{ background: `linear-gradient(150deg, ${C.forestDeep}, ${C.forest} 60%, ${C.emerald})` }}>
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07]" style={patternStyle} />
            <motion.div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: `radial-gradient(circle, ${C.gold}40, transparent 65%)`, filter: 'blur(30px)' }} animate={mounted && !reduce ? { scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] } : undefined} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
            <div className="relative mx-auto max-w-3xl">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: `${C.gold}22`, color: C.goldLight, border: `1px solid ${C.gold}55` }}>{Icons.heart}</div>
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-[2.75rem]" style={{ fontFamily: serif, color: C.parchment }}>
                هل أنت مستعد لإيجاد <span className="lux-gold-text">شريك حياتك؟</span>
              </h2>
              <p className="mx-auto mb-6 max-w-xl text-lg" style={{ color: '#CFE0D4' }}>انضم إلى آلاف المسلمين الذين وجدوا توافقهم من خلال طيبت — مجاناً تماماً</p>
              <div className="mb-9"><div {...stylex.props(sx.goldRule)} /></div>
              {/* shadcn/ui Button */}
              <Button asChild variant="gold" size="lg" className="lux-shine">
                <Link href="/register">ابدأ رحلتك الآن {Icons.arrow}</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="py-12" style={{ background: C.parchment }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 border-t pt-8 sm:flex-row" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold" style={{ background: `linear-gradient(135deg, ${C.forest}, ${C.emerald})`, color: C.goldLight }}>ط</div>
              <span className="text-base font-bold" style={{ fontFamily: serif, color: C.forest }}>طيبت</span>
              <span className="text-sm" style={{ color: C.muted }}>© {new Date().getFullYear()}</span>
            </div>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
              <div className="flex items-center gap-6 text-sm font-medium">
                <Link href="/login" className="transition-colors hover:opacity-70" style={{ color: C.forest }}>تسجيل الدخول</Link>
                <Link href="/register" className="transition-colors hover:opacity-70" style={{ color: C.forest }}>إنشاء حساب</Link>
                <Link href="/privacy" className="transition-colors hover:opacity-70" style={{ color: C.muted }}>الخصوصية</Link>
              </div>
              <span {...stylex.props(sx.stxTag)}>shadcn · daisyUI · Flowbite · Panda · StyleX</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
