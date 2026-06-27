import { apiClient } from '@/lib/api-client';

/** Public-STUN fallback used if the backend can't be reached. */
const STUN_FALLBACK: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

/**
 * ICE server configuration for WebRTC calls.
 *
 * STUN alone connects peers on permissive networks; symmetric NATs need a TURN
 * relay. We fetch the server list (incl. EPHEMERAL TURN credentials minted via
 * coturn's REST-API shared secret) from `GET /calls/ice-servers` so the
 * long-lived TURN secret never reaches the browser. On any failure we fall back
 * to public STUN so a call still has a chance of connecting.
 */
export async function fetchIceServers(): Promise<RTCIceServer[]> {
  try {
    const { data } = await apiClient.get('/calls/ice-servers');
    const servers = data?.data?.iceServers ?? data?.iceServers;
    if (Array.isArray(servers) && servers.length) return servers;
  } catch {
    // fall through to STUN-only
  }
  return STUN_FALLBACK;
}

export type CallType = 'audio' | 'video';

/** Phase of the call state machine, drives which UI the overlay renders. */
export type CallPhase =
  | 'idle'
  | 'outgoing' // we rang, waiting for the other side
  | 'incoming' // someone is ringing us
  | 'connecting' // accepted, negotiating SDP/ICE
  | 'active' // media flowing
  | 'ended';

export interface CallPeer {
  userId: string;
  conversationId: string;
  name?: string;
  avatar?: string;
  callType: CallType;
}
