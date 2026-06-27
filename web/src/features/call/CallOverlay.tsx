'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Phone, PhoneSlash, Microphone, MicrophoneSlash } from '@phosphor-icons/react';
import { resolveMediaUrl } from '@/lib/media';
import type { CallPeer, CallPhase } from './config';

interface Props {
  phase: CallPhase;
  peer: CallPeer | null;
  muted: boolean;
  error: string | null;
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
}

const STATUS_TEXT: Record<CallPhase, string> = {
  idle: '',
  outgoing: 'جارٍ الاتصال…',
  incoming: 'مكالمة واردة',
  connecting: 'جارٍ الاتصال…',
  active: '',
  ended: 'انتهت المكالمة',
};

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function CallOverlay({ phase, peer, muted, error, onAccept, onReject, onEnd, onToggleMute }: Props) {
  const [elapsed, setElapsed] = useState(0);

  // Tick the in-call timer only while media is flowing.
  useEffect(() => {
    if (phase !== 'active') { setElapsed(0); return; }
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  const name = peer?.name || 'مستخدم';
  const avatar = resolveMediaUrl(peer?.avatar);
  const initial = name.charAt(0).toUpperCase();
  const subtitle = phase === 'active' ? fmt(elapsed) : (error || STATUS_TEXT[phase]);

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-[88%] max-w-sm rounded-3xl px-6 py-8 flex flex-col items-center text-center"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}
      >
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
        <p className="mt-1 text-sm tabular-nums" style={{ color: error ? '#ef4444' : 'var(--muted-foreground)' }}>
          {subtitle}
        </p>
        <p className="mt-0.5 text-xs flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
          <Phone size={12} weight="fill" /> مكالمة صوتية
        </p>

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
              {(phase === 'active' || phase === 'connecting' || phase === 'outgoing') && (
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
