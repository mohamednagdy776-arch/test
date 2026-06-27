import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as crypto from 'crypto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok } from '../../common/response.helper';
import { User } from '../../auth/entities/user.entity';

/**
 * Hands the browser the ICE servers it needs for a WebRTC call.
 *
 * TURN credentials are EPHEMERAL (coturn's `use-auth-secret` / TURN REST API):
 * the long-lived shared secret never leaves the server. Each request mints a
 * `username = <expiry>:tayyibt` and `credential = base64(HMAC-SHA1(secret,
 * username))` that coturn validates and that expires after `TURN_TTL` seconds.
 * That way the relay can't be abused with stolen long-term credentials.
 *
 * Env:
 *   TURN_URLS   comma-separated turn: URIs (e.g.
 *               "turn:1.2.3.4:3478?transport=udp,turn:1.2.3.4:3478?transport=tcp")
 *   TURN_SECRET coturn static-auth-secret (required to emit TURN entries)
 *   TURN_TTL    credential lifetime in seconds (default 3600)
 *   STUN_URLS   comma-separated stun: URIs (defaults to public Google STUN)
 */
@UseGuards(AuthGuard('jwt'))
@Controller('calls')
export class CallsController {
  @Get('ice-servers')
  getIceServers(@CurrentUser() user: User) {
    const stunUrls = (process.env.STUN_URLS ||
      'stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302')
      .split(',').map((s) => s.trim()).filter(Boolean);

    const iceServers: Array<{ urls: string | string[]; username?: string; credential?: string }> = [
      { urls: stunUrls },
    ];

    const turnUrls = (process.env.TURN_URLS || '')
      .split(',').map((s) => s.trim()).filter(Boolean);
    const secret = process.env.TURN_SECRET;

    if (turnUrls.length && secret) {
      const ttl = parseInt(process.env.TURN_TTL || '3600', 10);
      const expiry = Math.floor(Date.now() / 1000) + ttl;
      // Bind the credential loosely to the user for auditability; coturn only
      // checks the HMAC, not the suffix.
      const username = `${expiry}:${user.id}`;
      const credential = crypto
        .createHmac('sha1', secret)
        .update(username)
        .digest('base64');
      iceServers.push({ urls: turnUrls, username, credential });
    }

    return ok({ iceServers });
  }
}
