'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Phone, PhoneSlash, Microphone, MicrophoneSlash,
  SpeakerHigh, SpeakerSlash, ArrowsIn, ArrowsOut,
  VideoCamera, VideoCameraSlash,
} from '@phosphor-icons/react';
import { resolveMediaUrl } from '@/lib/media';
import type { CallPeer, CallPhase, CallQuality } from './config';

interface Props {
  phase: CallPhase;
  peer: CallPeer | null;
  muted: boolean;
  speakerOn: boolean;
  peerMuted: boolean;
  cameraOn: boolean;
  peerCameraOff: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  quality: CallQuality;
  error: string | null;
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onToggleCamera: () => void;
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

/** A <video> sink that binds a MediaStream imperatively (React can't pass srcObject as a prop). */
function StreamVideo({
  stream, muted, mirror, className, style,
}: {
  stream: MediaStream | null;
  muted: boolean;
  mirror?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.srcObject !== stream) {
      el.srcObject = stream;
      if (stream) void el.play().catch(() => { /* autoplay guard */ });
    }
  }, [stream]);
  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      className={className}
      style={{ transform: mirror ? 'scaleX(-1)' : undefined, ...style }}
    />
  );
}

export function CallOverlay({
  phase, peer, muted, speakerOn, peerMuted, cameraOn, peerCameraOff,
  localStream, remoteStream, quality, error,
  onAccept, onReject, onEnd, onToggleMute, onToggleSpeaker, onToggleCamera,
}: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [minimized, setMinimized] = useState(false);

  const inCall = phase === 'active' || phase === 'reconnecting';
  const isVideo = peer?.callType === 'video';

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
    const icon = isVideo ? '📹' : '📞';
    if (inCall) document.title = `${icon} ${fmt(elapsed)} · ${name}`;
    else if (phase === 'incoming') document.title = `${icon} مكالمة واردة · ${name}`;
    else if (phase === 'outgoing' || phase === 'connecting') document.title = `${icon} ${name}…`;
    return () => { if (prevTitle.current) document.title = prevTitle.current; };
  }, [inCall, phase, elapsed, peer?.name, isVideo]);

  const name = peer?.name || 'مستخدم';
  const avatar = resolveMediaUrl(peer?.avatar);
  const initial = name.charAt(0).toUpperCase();
  const subtitle = phase === 'active' ? fmt(elapsed) : (error || STATUS_TEXT[phase]);
  const canMinimize = phase !== 'incoming' && phase !== 'ended';
  const callKindLabel = isVideo ? 'مكالمة فيديو' : 'مكالمة صوتية';

  // Whether the remote party's video should actually be on screen.
  const remoteVideoLive = isVideo && inCall && !peerCameraOff
    && !!remoteStream && remoteStream.getVideoTracks().some((t) => t.readyState === 'live');

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

  // ── Video call: full-screen stage with remote feed + self-preview ──────
  if (isVideo && phase !== 'incoming' && phase !== 'ended') {
    return (
      <div dir="rtl" className="fixed inset-0 z-[100] animate-fade-in" style={{ background: '#0b0b0b' }}>
        {/* Remote feed (or avatar placeholder until it arrives / camera off) */}
        <div className="absolute inset-0 flex items-center justify-center">
          {remoteVideoLive ? (
            <StreamVideo stream={remoteStream} muted className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 text-center px-6">
              <div className="relative">
                {(phase === 'outgoing' || phase === 'connecting') && (
                  <span className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(255,255,255,0.12)' }} />
                )}
                <div
                  className="relative h-28 w-28 rounded-full overflow-hidden flex items-center justify-center text-4xl font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
                >
                  {avatar ? <Image src={avatar} alt={name} width={112} height={112} className="w-full h-full object-cover" /> : initial}
                </div>
              </div>
              <p className="text-lg font-bold text-white">{name}</p>
              <p className="text-sm flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {inCall && !error && <QualityBars quality={quality} />}
                {inCall && !error ? (peerCameraOff ? 'أوقف الكاميرا' : 'في انتظار الفيديو…') : subtitle}
              </p>
            </div>
          )}
        </div>

        {/* Top gradient + meta */}
        <div className="absolute top-0 inset-x-0 px-5 py-4 flex items-start justify-between"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)' }}>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <VideoCamera size={15} weight="fill" /> {name}
            </span>
            <span className="text-xs tabular-nums flex items-center gap-1.5"
              style={{ color: phase === 'reconnecting' ? '#f59e0b' : 'rgba(255,255,255,0.75)' }}>
              {inCall && <QualityBars quality={quality} />}
              {phase === 'active' ? fmt(elapsed) : (error || STATUS_TEXT[phase] || callKindLabel)}
            </span>
            {inCall && peerMuted && (
              <span className="mt-1 text-[11px] flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                <MicrophoneSlash size={12} weight="fill" /> الطرف الآخر كتم الميكروفون
              </span>
            )}
          </div>
          {canMinimize && (
            <button
              onClick={() => setMinimized(true)}
              title="تصغير"
              className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
            >
              <ArrowsIn size={18} weight="bold" />
            </button>
          )}
        </div>

        {/* Self-preview PiP */}
        <div
          className="absolute top-20 left-4 w-28 h-40 rounded-2xl overflow-hidden shadow-xl"
          style={{ border: '2px solid rgba(255,255,255,0.25)', background: '#1a1a1a' }}
        >
          {cameraOn && localStream ? (
            <StreamVideo stream={localStream} muted mirror className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <VideoCameraSlash size={24} weight="fill" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 inset-x-0 px-6 pb-8 pt-12 flex items-center justify-center gap-5"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}>
          <CallButton
            color={muted ? '#fff' : 'rgba(255,255,255,0.9)'}
            bg={muted ? '#ef4444' : 'rgba(255,255,255,0.18)'}
            label={muted ? 'إلغاء الكتم' : 'كتم'}
            onClick={onToggleMute}
            dark
          >
            {muted ? <MicrophoneSlash size={24} weight="fill" /> : <Microphone size={24} weight="fill" />}
          </CallButton>
          <CallButton
            color="#fff"
            bg={cameraOn ? 'rgba(255,255,255,0.18)' : '#ef4444'}
            label={cameraOn ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا'}
            onClick={onToggleCamera}
            dark
          >
            {cameraOn ? <VideoCamera size={24} weight="fill" /> : <VideoCameraSlash size={24} weight="fill" />}
          </CallButton>
          <CallButton
            color="#fff"
            bg={speakerOn ? 'rgba(255,255,255,0.18)' : '#ef4444'}
            label={speakerOn ? 'مكبر الصوت' : 'كتم السماعة'}
            onClick={onToggleSpeaker}
            dark
          >
            {speakerOn ? <SpeakerHigh size={24} weight="fill" /> : <SpeakerSlash size={24} weight="fill" />}
          </CallButton>
          <CallButton color="#ef4444" label="إنهاء" onClick={onEnd}>
            <PhoneSlash size={26} weight="fill" />
          </CallButton>
        </div>
      </div>
    );
  }

  // ── Full overlay (audio calls + video ringing/incoming/ended) ──────────
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
          {isVideo ? <VideoCamera size={12} weight="fill" /> : <Phone size={12} weight="fill" />} {callKindLabel}
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
                {isVideo ? <VideoCamera size={26} weight="fill" /> : <Phone size={26} weight="fill" />}
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
  children, color, bg, label, onClick, pulse, dark,
}: {
  children: React.ReactNode;
  color: string;
  bg?: string;
  label: string;
  onClick: () => void;
  pulse?: boolean;
  dark?: boolean;
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
      <span className="text-[11px]" style={{ color: dark ? 'rgba(255,255,255,0.85)' : 'var(--muted-foreground)' }}>{label}</span>
    </button>
  );
}
