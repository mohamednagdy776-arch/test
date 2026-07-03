import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Session } from '../entities/session.entity';
import { readCookie } from '../cookie.util';

// Pull the JWT from the HttpOnly `access_token` cookie first (browser), then
// fall back to the Authorization: Bearer header (mobile / API clients).
const fromCookie = (req: any): string | null =>
  readCookie(req?.headers?.cookie, 'access_token') ?? null;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Session) private sessionsRepo: Repository<Session>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        fromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { sub: string; sessionId?: string }) {
    // findOne excludes soft-deleted rows (@DeleteDateColumn), so deleted users
    // are already rejected; also reject banned and deactivated accounts.
    const user = await this.usersRepo.findOne({ where: { id: payload.sub } });
    if (!user || user.status === 'banned' || user.isDeactivated) throw new UnauthorizedException();

    // Enforce "Revoke session" (#143): previously a revoked session's DB row
    // (isActive=false) was never consulted here, so an already-issued access
    // token kept authenticating the target device until it naturally expired.
    // Tokens minted before this fix carry no sessionId — treated as before
    // (session-less, always allowed) rather than breaking every existing login.
    if (payload.sessionId) {
      const session = await this.sessionsRepo.findOne({ where: { id: payload.sessionId } });
      if (!session || !session.isActive) throw new UnauthorizedException();
    }

    return user;
  }
}
