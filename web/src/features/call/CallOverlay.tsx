'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Phone, PhoneSlash, Microphone, MicrophoneSlash,
  SpeakerHigh, SpeakerSlash, ArrowsIn, ArrowsOut,
} from '@phosphor-icons/react';
import { resolveMediaUrl } from '@/lib/media';
import type { CallPeer, CallPhase, CallQuality } from './config';

interface Props {
  phase: CallPhase;
  peer: CallPeer | null;
  muted: boolean;
  speakerOn: boolean;
  peerMuted: boolean;
  quality: CallQuality;
  error: string | null;
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
}

const STATUS_TEXT: Record<CallPhase, string> = {
  idle: '',
  outgoing: 'جارٍ الاتصال…',
  incoming: 'مكالمة واردة',
  connecting: 'جارٍ الاتصال…',
  active: '',
  reconnecting: 'جارٍ إعادة الاتصال…',
  ended: 'انتهت المكالمة',
};

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const QUALITY_COLOR: Record<Exclude<CallQuality, 'unknown'>, string> = {
  good: '#22c55e',
  fair: '#f59e0b',
  poor: '#ef4444',
};

/** Three-bar signal strength indicator. */
function QualityBars({ quality }: { quality: CallQuality }) {
  if (quality === 'unknown') return null;
  const lit = quality === 'good' ? 3 : quality === 'fair' ? 2 : 1;
  const color = QUALITY_COLOR[quality];
  return (
    <span className="inline-flex items-end gap-0.5" title="جودة الاتصال" aria-label="جودة الاتصال">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 3,
            height: 5 + i * 4,
            borderRadius: 1,
            background: i < lit ? color : 'var(--border)',
          }}
        />
      ))}
    </span>
  );
}

export function CallOverlay({
  phase, peer, muted, speakerOn, peerMuted, quality, error,
  onAccept, onReject, onEnd, onToggleMute, onToggleSpeaker,
}: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [minimized, setMinimized] = useState(false);

  const inCall = phase === 'active' || phase === 'reconnecting';

  // Tick the in-call timer while media is (or was briefly) flowing. Keep it
  // running across a transient 'reconnecting' so the duration isn't lost.
  useEffect(() => {
    if (!inCall) { setElapsed(0); return; }
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [inCall]);

  // Reflect the call in the browser tab title; restore on teardown.
  const prevTitle = useRef<string>('');
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!prevTitle.current) prevTitle.current = document.title;
    const name = peer?.name || 'مكالمة';
    if (inCall) document.title = `📞 ${fmt(elapsed)} · ${name}`;
    else if (phase === 'incoming') document.title = `📞 مكالمة واردة · ${name}`;
    else if (phase === 'outgoing' || phase === 'connecting') document.title = `📞 ${name}…`;
    return () => { if (prevTitle.current) document.title = prevTitle.current; };
  }, [inCall, phase, elapsed, peer?.name]);

  const name = peer?.name || 'مستخدم';
  const avatar = resolveMediaUrl(peer?.avatar);
  const initial = name.charAt(0).toUpperCase();
  const subtitle = phase === 'active' ? fmt(elapsed) : (error || STATUS_TEXT[phase]);
  const canMinimize = phase !== 'incoming' && phase !== 'ended';

  // ── Minimized: compact floating bar so the user can keep browsing ──────
  if (minimized && canMinimize) {
    return (
      <div
        dir="rtl"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 rounded-full px-3 py-2 animate-fade-in"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
      >
        <div
          className="h-9 w-9 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
        >
          {avatar ? <Image src={avatar} alt={name} width={36} height={36} className="w-full h-full object-cover" /> : initial}
        </div>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-xs font-semibold truncate max-w-[8rem]" style={{ color: 'var(--foreground)' }}>{name}</span>
          <span className="text-[11px] tabular-nums flex items-center gap-1" style={{ color: phase === 'reconnecting' ? '#f59e0b' : 'var(--muted-foreground)' }}>
            {inCall && <QualityBars quality={quality} />}
            {phase === 'active' ? fmt(elapsed) : STATUS_TEXT[phase]}
          </span>
        </div>
        <button
          onClick={() => setMinimized(false)}
          title="تكبير"
          className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110"
          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
        >
          <ArrowsOut size={18} weight="bold" />
        </button>
        <button
          onClick={onEnd}
          title="إنهاء"
          className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-transform hover:scale-110"
          style={{ background: '#ef4444' }}
        >
          <PhoneSlash size={18} weight="fill" />
        </button>
      </div>
    );
  }

  // ── Full overlay ───────────────────────────────────────────────────────
  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="relative w-[88%] max-w-sm rounded-3xl px-6 py-8 flex flex-col items-center text-center"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}
      >
        {/* Minimize */}
        {canMinimize && (
          <button
            onClick={() => setMinimized(true)}
            title="تصغير"
            className="absolute top-3 left-3 flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
          >
            <ArrowsIn size={18} weight="bold" />
          </button>
        )}

        {/* Avatar with a soft pulsing ring while ringing */}
        <div className="relative mb-5">
          {(phase === 'outgoing' || phase === 'incoming') && (
            <span
              className="absolute inset-0 rounded-full animate-ping"
              style={{ background: 'color-mix(in srgb, var(--primary) 35%, transparent)' }}
            />
          )}
          <div
            className="relative h-24 w-24 rounded-full overflow-hidden flex items-center justify-center text-3xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
          >
            {avatar ? (
              <Image src={avatar} alt={name} width={96} height={96} className="w-full h-full object-cover" />
            ) : initial}
          </div>
        </div>

        <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{name}</h2>
        <p
          className="mt-1 text-sm tabular-nums flex items-center justify-center gap-1.5"
          style={{ color: error ? '#ef4444' : (phase === 'reconnecting' ? '#f59e0b' : 'var(--muted-foreground)') }}
        >
          {inCall && !error && <QualityBars quality={quality} />}
          {subtitle}
        </p>
        <p className="mt-0.5 text-xs flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
          <Phone size={12} weight="fill" /> مكالمة صوتية
        </p>
        {/* Peer's mic state */}
        {inCall && peerMuted && (
          <p className="mt-2 text-xs flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
            <MicrophoneSlash size={13} weight="fill" /> الطرف الآخر كتم الميكروفون
          </p>
        )}

        {/* Controls */}
        <div className="mt-8 flex items-center justify-center gap-5">
          {phase === 'incoming' ? (
            <>
              <CallButton color="#ef4444" label="رفض" onClick={onReject}>
                <PhoneSlash size={26} weight="fill" />
              </CallButton>
              <CallButton color="#22c55e" label="قبول" onClick={onAccept} pulse>
                <Phone size={26} weight="fill" />
              </CallButton>
            </>
          ) : (
            <>
              {inCall && (
                <CallButton
                  color={speakerOn ? 'var(--muted-foreground)' : 'var(--accent)'}
                  bg="var(--muted)"
                  label={speakerOn ? 'مكبر الصوت' : 'كتم السماعة'}
                  onClick={onToggleSpeaker}
                >
                  {speakerOn ? <SpeakerHigh size={24} weight="fill" /> : <SpeakerSlash size={24} weight="fill" />}
                </CallButton>
              )}
              {(phase === 'active' || phase === 'reconnecting' || phase === 'connecting' || phase === 'outgoing') && (
                <CallButton
                  color={muted ? 'var(--accent)' : 'var(--muted-foreground)'}
                  bg="var(--muted)"
                  label={muted ? 'إلغاء الكتم' : 'كتم'}
                  onClick={onToggleMute}
                >
                  {muted ? <MicrophoneSlash size={24} weight="fill" /> : <Microphone size={24} weight="fill" />}
                </CallButton>
              )}
              {phase !== 'ended' && (
                <CallButton color="#ef4444" label="إنهاء" onClick={onEnd}>
                  <PhoneSlash size={26} weight="fill" />
                </CallButton>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CallButton({
  children, color, bg, label, onClick, pulse,
}: {
  children: React.ReactNode;
  color: string;
  bg?: string;
  label: string;
  onClick: () => void;
  pulse?: boolean;
}) {
  const filled = !bg;
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 group" title={label}>
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-full transition-all group-hover:scale-110 ${pulse ? 'animate-pulse' : ''}`}
        style={{
          background: filled ? color : bg,
          color: filled ? '#fff' : color,
          boxShadow: filled ? '0 6px 18px rgba(0,0,0,0.25)' : 'none',
        }}
      >
        {children}
      </span>
      <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
    </button>
  );
}
