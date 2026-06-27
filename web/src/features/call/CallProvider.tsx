'use client';

import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
} from 'react';
import { getSocket, getCurrentUserId } from '@/lib/socket-client';
import { fetchIceServers, type CallPeer, type CallPhase, type CallType } from './config';
import { CallOverlay } from './CallOverlay';

interface StartCallArgs {
  conversationId: string;
  calleeId: string;
  name?: string;
  avatar?: string;
  callType?: CallType;
}

interface CallContextValue {
  phase: CallPhase;
  peer: CallPeer | null;
  muted: boolean;
  /** error message (e.g. mic permission denied, callee offline) or null */
  error: string | null;
  startCall: (args: StartCallArgs) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
}

const CallContext = createContext<CallContextValue | null>(null);

export function useCall(): CallContextValue {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used within <CallProvider>');
  return ctx;
}

export function CallProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<CallPhase>('idle');
  const [peer, setPeer] = useState<CallPeer | null>(null);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs hold the live WebRTC objects so socket handlers always see current
  // values without re-subscribing on every render.
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const peerRef = useRef<CallPeer | null>(null);
  const phaseRef = useRef<CallPhase>('idle');
  // ICE candidates can arrive before remoteDescription is set; buffer them.
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);

  const setPhaseBoth = useCallback((p: CallPhase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const setPeerBoth = useCallback((p: CallPeer | null) => {
    peerRef.current = p;
    setPeer(p);
  }, []);

  /** Tear everything down and return to idle. Safe to call multiple times. */
  const cleanup = useCallback(() => {
    pcRef.current?.getSenders().forEach((s) => s.track?.stop());
    try { pcRef.current?.close(); } catch { /* already closed */ }
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    pendingIceRef.current = [];
    setMuted(false);
  }, []);

  /** Build the RTCPeerConnection, attach the mic stream, and wire signalling. */
  const buildPeerConnection = useCallback(async (target: CallPeer): Promise<RTCPeerConnection> => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: target.callType === 'video',
    });
    localStreamRef.current = stream;

    const iceServers = await fetchIceServers();
    const pc = new RTCPeerConnection({ iceServers });
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.onicecandidate = (e) => {
      if (e.candidate && peerRef.current) {
        getSocket().emit('call:ice-candidate', {
          conversationId: peerRef.current.conversationId,
          targetId: peerRef.current.userId,
          candidate: e.candidate.toJSON(),
        });
      }
    };

    pc.ontrack = (e) => {
      const [remote] = e.streams;
      if (remoteAudioRef.current && remote) {
        remoteAudioRef.current.srcObject = remote;
        void remoteAudioRef.current.play().catch(() => { /* autoplay guard */ });
      }
    };

    pc.onconnectionstatechange = () => {
      const st = pc.connectionState;
      if (st === 'connected') setPhaseBoth('active');
      if (st === 'failed' || st === 'disconnected' || st === 'closed') {
        // Only treat as a hangup once we were past negotiation. No need to
        // notify the peer — the transport already dropped.
        if (phaseRef.current === 'active' || phaseRef.current === 'connecting') {
          cleanup();
          setPhaseBoth('ended');
          setPeerBoth(null);
          window.setTimeout(() => { if (phaseRef.current === 'ended') setPhaseBoth('idle'); }, 1500);
        }
      }
    };

    pcRef.current = pc;
    return pc;
  }, [cleanup, setPhaseBoth, setPeerBoth]);

  /** Apply any ICE candidates that arrived before the remote description. */
  const drainPendingIce = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;
    const queued = pendingIceRef.current;
    pendingIceRef.current = [];
    for (const c of queued) {
      try { await pc.addIceCandidate(c); } catch { /* stale candidate */ }
    }
  }, []);

  // endCallInternal: optionally notify the peer, then reset.
  const endCallInternal = useCallback((notify: boolean) => {
    const p = peerRef.current;
    if (notify && p) {
      getSocket().emit('call:end', { conversationId: p.conversationId, targetId: p.userId });
    }
    cleanup();
    setPhaseBoth('ended');
    setPeerBoth(null);
    // brief "ended" flash, then fully reset
    window.setTimeout(() => {
      if (phaseRef.current === 'ended') setPhaseBoth('idle');
    }, 1500);
  }, [cleanup, setPhaseBoth, setPeerBoth]);

  // ── Public actions ────────────────────────────────────────────────────

  const startCall = useCallback(async ({ conversationId, calleeId, name, avatar, callType = 'audio' }: StartCallArgs) => {
    if (phaseRef.current !== 'idle') return;
    setError(null);
    const target: CallPeer = { userId: calleeId, conversationId, name, avatar, callType };
    setPeerBoth(target);
    setPhaseBoth('outgoing');
    try {
      await buildPeerConnection(target);
    } catch {
      setError('تعذّر الوصول إلى الميكروفون. تأكّد من منح الإذن.');
      cleanup();
      setPhaseBoth('idle');
      setPeerBoth(null);
      return;
    }
    getSocket().emit(
      'call:initiate',
      {
        conversationId,
        calleeId,
        callType,
        callerName: name,
        callerAvatar: avatar,
      },
      (ack: { ok: boolean; reason?: string }) => {
        if (!ack?.ok) {
          setError(ack?.reason === 'offline' ? 'المستخدم غير متصل حالياً' : 'تعذّر بدء المكالمة');
          cleanup();
          setPhaseBoth('idle');
          setPeerBoth(null);
        }
      },
    );
  }, [buildPeerConnection, cleanup, setPeerBoth, setPhaseBoth]);

  const acceptCall = useCallback(async () => {
    const p = peerRef.current;
    if (!p || phaseRef.current !== 'incoming') return;
    setPhaseBoth('connecting');
    try {
      await buildPeerConnection(p);
    } catch {
      setError('تعذّر الوصول إلى الميكروفون. تأكّد من منح الإذن.');
      getSocket().emit('call:reject', { conversationId: p.conversationId, targetId: p.userId });
      cleanup();
      setPhaseBoth('idle');
      setPeerBoth(null);
      return;
    }
    // Tell the caller we're ready; it will respond with an SDP offer.
    getSocket().emit('call:accept', { conversationId: p.conversationId, targetId: p.userId });
  }, [buildPeerConnection, cleanup, setPeerBoth, setPhaseBoth]);

  const rejectCall = useCallback(() => {
    const p = peerRef.current;
    if (p) getSocket().emit('call:reject', { conversationId: p.conversationId, targetId: p.userId });
    cleanup();
    setPhaseBoth('idle');
    setPeerBoth(null);
  }, [cleanup, setPeerBoth, setPhaseBoth]);

  const endCall = useCallback(() => endCallInternal(true), [endCallInternal]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const next = !muted;
    stream.getAudioTracks().forEach((t) => { t.enabled = !next; });
    setMuted(next);
  }, [muted]);

  // ── Socket signalling ─────────────────────────────────────────────────
  useEffect(() => {
    const myId = getCurrentUserId();
    if (!myId) return;
    const socket = getSocket();

    const onIncoming = (d: { from: string; conversationId: string; callType: CallType; callerName?: string; callerAvatar?: string }) => {
      // Already busy → auto-decline so the caller isn't left ringing.
      if (phaseRef.current !== 'idle') {
        socket.emit('call:reject', { conversationId: d.conversationId, targetId: d.from });
        return;
      }
      setError(null);
      setPeerBoth({
        userId: d.from,
        conversationId: d.conversationId,
        name: d.callerName,
        avatar: d.callerAvatar,
        callType: d.callType ?? 'audio',
      });
      setPhaseBoth('incoming');
    };

    // Caller side: callee accepted → create and send the SDP offer.
    const onAccepted = async () => {
      const pc = pcRef.current;
      const p = peerRef.current;
      if (!pc || !p) return;
      setPhaseBoth('connecting');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('call:offer', { conversationId: p.conversationId, targetId: p.userId, sdp: offer });
    };

    // Callee side: received offer → answer it.
    const onOffer = async (d: { from: string; conversationId: string; sdp: RTCSessionDescriptionInit }) => {
      const pc = pcRef.current;
      const p = peerRef.current;
      if (!pc || !p || d.from !== p.userId) return;
      await pc.setRemoteDescription(new RTCSessionDescription(d.sdp));
      await drainPendingIce();
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('call:answer', { conversationId: p.conversationId, targetId: p.userId, sdp: answer });
    };

    // Caller side: received the answer.
    const onAnswer = async (d: { from: string; sdp: RTCSessionDescriptionInit }) => {
      const pc = pcRef.current;
      if (!pc || d.from !== peerRef.current?.userId) return;
      await pc.setRemoteDescription(new RTCSessionDescription(d.sdp));
      await drainPendingIce();
    };

    const onIce = async (d: { from: string; candidate: RTCIceCandidateInit }) => {
      const pc = pcRef.current;
      if (!pc || d.from !== peerRef.current?.userId) return;
      if (pc.remoteDescription && pc.remoteDescription.type) {
        try { await pc.addIceCandidate(d.candidate); } catch { /* stale */ }
      } else {
        pendingIceRef.current.push(d.candidate);
      }
    };

    const onRejected = () => {
      if (phaseRef.current === 'idle') return;
      setError('تم رفض المكالمة');
      cleanup();
      setPhaseBoth('ended');
      setPeerBoth(null);
      window.setTimeout(() => { if (phaseRef.current === 'ended') setPhaseBoth('idle'); }, 1500);
    };

    const onEnded = () => {
      if (phaseRef.current === 'idle') return;
      cleanup();
      setPhaseBoth('ended');
      setPeerBoth(null);
      window.setTimeout(() => { if (phaseRef.current === 'ended') setPhaseBoth('idle'); }, 1500);
    };

    socket.on('call:incoming', onIncoming);
    socket.on('call:accepted', onAccepted);
    socket.on('call:offer', onOffer);
    socket.on('call:answer', onAnswer);
    socket.on('call:ice-candidate', onIce);
    socket.on('call:rejected', onRejected);
    socket.on('call:ended', onEnded);

    return () => {
      socket.off('call:incoming', onIncoming);
      socket.off('call:accepted', onAccepted);
      socket.off('call:offer', onOffer);
      socket.off('call:answer', onAnswer);
      socket.off('call:ice-candidate', onIce);
      socket.off('call:rejected', onRejected);
      socket.off('call:ended', onEnded);
    };
  }, [cleanup, drainPendingIce, setPeerBoth, setPhaseBoth]);

  return (
    <CallContext.Provider value={{ phase, peer, muted, error, startCall, acceptCall, rejectCall, endCall, toggleMute }}>
      {children}
      {/* Hidden sink for the remote party's audio. */}
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
      {phase !== 'idle' && (
        <CallOverlay
          phase={phase}
          peer={peer}
          muted={muted}
          error={error}
          onAccept={acceptCall}
          onReject={rejectCall}
          onEnd={endCall}
          onToggleMute={toggleMute}
        />
      )}
    </CallContext.Provider>
  );
}
