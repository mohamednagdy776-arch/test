import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';
import { generateTotpSecret, verifyTotp, buildOtpauthUrl } from '../utils/totp';
import { User } from '../entities/user.entity';
import { Session } from '../entities/session.entity';
import { EmailChangeRequest } from '../entities/email-change-request.entity';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Session) private sessionsRepo: Repository<Session>,
    @InjectRepository(EmailChangeRequest) private emailChangeRepo: Repository<EmailChangeRequest>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  // ── Email change (#454) ─────────────────────────────────────────────────
  // Require the current password, then email a verification link to the NEW
  // address. The change only applies once that link is confirmed.
  async requestEmailChange(userId: string, newEmailRaw: string, currentPassword: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    const newEmail = newEmailRaw.trim().toLowerCase();
    if (newEmail === (user.email || '').toLowerCase()) {
      throw new ConflictException('That is already your email address');
    }
    const taken = await this.usersRepo.findOne({ where: { email: newEmail } });
    if (taken) throw new ConflictException('That email address is already in use');

    await this.emailChangeRepo.delete({ userId }); // supersede any prior request
    const token = randomBytes(32).toString('hex');
    await this.emailChangeRepo.save(this.emailChangeRepo.create({
      userId,
      newEmail,
      tokenHash: this.hashToken(token),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    }));
    await this.mailService.sendEmailChangeVerification(newEmail, token);
    return { message: 'A verification link has been sent to the new email address.' };
  }

  // Apply the change once the link is confirmed: update email, drop the request,
  // invalidate all sessions (#426), and alert the OLD address (#470).
  async confirmEmailChange(token: string) {
    const reqRow = await this.emailChangeRepo.findOne({ where: { tokenHash: this.hashToken(token) } });
    if (!reqRow) throw new NotFoundException('Invalid or expired link');
    if (reqRow.expiresAt < new Date()) {
      await this.emailChangeRepo.delete(reqRow.id);
      throw new ForbiddenException('This link has expired');
    }
    const user = await this.usersRepo.findOne({ where: { id: reqRow.userId } });
    if (!user) throw new NotFoundException('User not found');

    const stillTaken = await this.usersRepo.findOne({ where: { email: reqRow.newEmail } });
    if (stillTaken && stillTaken.id !== user.id) {
      await this.emailChangeRepo.delete(reqRow.id);
      throw new ConflictException('That email address is already in use');
    }

    const oldEmail = user.email;
    await this.usersRepo.update(user.id, { email: reqRow.newEmail });
    await this.emailChangeRepo.delete({ userId: user.id });
    await this.sessionsRepo.delete({ userId: user.id }); // #426 — force re-login
    await this.mailService.sendEmailChangedAlert(oldEmail, reqRow.newEmail); // #470
    return { message: 'Your email has been updated. Please log in again.' };
  }

  async register(dto: RegisterDto) {
    const exists = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already registered');

    const usernameExists = dto.username ? await this.usersRepo.findOne({ where: { username: dto.username } }) : null;
    if (usernameExists) throw new ConflictException('Username already taken');

    // Pre-check phone too, so a duplicate gives a clear message instead of a
    // raw DB unique-violation (which leaked that phone enumeration differs).
    const phoneExists = dto.phone ? await this.usersRepo.findOne({ where: { phone: dto.phone } }) : null;
    if (phoneExists) throw new ConflictException('Phone number already registered');

    if (dto.dateOfBirth) {
      const dob = new Date(dto.dateOfBirth);
      const minAge = new Date();
      minAge.setFullYear(minAge.getFullYear() - 18);
      if (dob > minAge) throw new BadRequestException('You must be at least 18 years old to register');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const verificationToken = randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const fullName = [dto.firstName, dto.lastName].filter(Boolean).join(' ');

    const user = this.usersRepo.create({
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      username: dto.username,
      fullName,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      gender: dto.gender,
      verificationToken: this.hashToken(verificationToken),
      verificationExpires,
      status: 'active', // Auto-activate for development
      isVerified: true, // Auto-verify for development
    });

    await this.usersRepo.save(user);
    await this.mailService.sendVerificationEmail(dto.email, verificationToken);

    return this.signTokens(user);
  }

  async login(dto: LoginDto, deviceInfo?: { browser?: string; ip?: string; deviceName?: string }) {
    const user = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException('Account locked due to too many failed attempts');
    }

    if (user.isDeactivated) {
      throw new ForbiddenException('Account is deactivated');
    }

    // Skip verification check for development
    // if (!user.isVerified) {
    //   throw new ForbiddenException('Please verify your email first');
    // }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      await this.handleFailedLogin(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.twoFactorEnabled) {
      // Challenge for a second factor on EVERY login once 2FA is enabled. (The
      // old gate `enabled && !verified` skipped 2FA forever after the first
      // successful challenge — i.e. 2FA only ever applied once.)
      // Issue a short-lived pre-auth token (bound to this password-verified
      // user) instead of returning a raw userId the client could swap out.
      const preAuthToken = this.jwtService.sign(
        { sub: user.id, type: 'pre-auth' },
        { expiresIn: '5m' },
      );
      return { requiresTwoFactor: true, preAuthToken };
    }

    await this.handleSuccessfulLogin(user, dto.rememberMe, deviceInfo);

    return {
      ...this.signTokens(user, dto.rememberMe ? '30d' : '7d'),
      user: this.sanitizeUser(user),
    };
  }

  async verifyTwoFactor(preAuthToken: string, code: string, deviceInfo?: { browser?: string; ip?: string; deviceName?: string }) {
    // Derive the user from the signed pre-auth token, NOT from a client field —
    // closes the bypass where any UUID could be submitted with a TOTP code.
    let userId: string;
    try {
      const payload: any = this.jwtService.verify(preAuthToken, { secret: process.env.JWT_SECRET });
      if (payload.type !== 'pre-auth') throw new UnauthorizedException();
      userId = payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid or expired 2FA session');
    }
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user || !user.twoFactorEnabled) throw new UnauthorizedException();

    if (verifyTotp(code, user.totpSecret)) {
      // valid authenticator code
    } else {
      // Fall back to a one-time backup code (#759), consuming it on success.
      const remaining = this.consumeBackupCode(code, user.twoFactorBackupCodes);
      if (remaining === null) throw new UnauthorizedException('Invalid code');
      await this.usersRepo.update(userId, { twoFactorBackupCodes: JSON.stringify(remaining) });
    }

    await this.usersRepo.update(userId, { twoFactorVerified: true });
    await this.handleSuccessfulLogin(user, false, deviceInfo);

    return {
      ...this.signTokens(user),
      user: this.sanitizeUser(user),
    };
  }

  private hashBackupCode(code: string): string {
    return createHash('sha256').update(code.replace(/\s+/g, '').toUpperCase()).digest('hex');
  }

  // Generate N single-use backup codes. Returns the plaintext codes (shown to the
  // user exactly once) and their SHA-256 hashes (persisted) so a lost authenticator
  // doesn't mean a permanent lockout (#759).
  private generateBackupCodes(count = 10): { plain: string[]; hashes: string[] } {
    const plain: string[] = [];
    for (let i = 0; i < count; i++) {
      // 10 hex chars, grouped for readability (e.g. "A1B2C-3D4E5").
      const raw = randomBytes(5).toString('hex').toUpperCase();
      plain.push(`${raw.slice(0, 5)}-${raw.slice(5)}`);
    }
    return { plain, hashes: plain.map((c) => this.hashBackupCode(c)) };
  }

  // Validate a submitted backup code against the stored hashes. On success returns
  // the remaining hashes (the used code is consumed) so the caller can persist them.
  private consumeBackupCode(code: string, stored: string | null): string[] | null {
    if (!stored) return null;
    let hashes: string[];
    try {
      hashes = JSON.parse(stored);
    } catch {
      return null;
    }
    const target = this.hashBackupCode(code);
    const idx = hashes.indexOf(target);
    if (idx === -1) return null;
    hashes.splice(idx, 1);
    return hashes;
  }

  private async handleFailedLogin(user: User) {
    const attempts = user.failedLoginAttempts + 1;
    if (attempts >= 5) {
      const lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      await this.usersRepo.update(user.id, { failedLoginAttempts: attempts, lockedUntil });
    } else {
      await this.usersRepo.update(user.id, { failedLoginAttempts: attempts });
    }
  }

  private async handleSuccessfulLogin(user: User, rememberMe?: boolean, deviceInfo?: { browser?: string; ip?: string; deviceName?: string }) {
    await this.usersRepo.update(user.id, { 
      failedLoginAttempts: 0, 
      lockedUntil: null as any,
      status: user.status === 'pending' ? 'active' : user.status,
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: rememberMe ? '30d' : '7d' }
    );
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

    const session = this.sessionsRepo.create({
      userId: user.id,
      refreshTokenHash,
      browser: deviceInfo?.browser,
      ipAddress: deviceInfo?.ip,
      deviceName: deviceInfo?.deviceName,
      lastActive: new Date(),
    });
    await this.sessionsRepo.save(session);

    await this.mailService.sendNewDeviceLoginEmail(
      user.email,
      deviceInfo?.deviceName || 'Unknown device',
      deviceInfo?.ip || 'Unknown IP'
    );
  }

  // Store only a SHA-256 hash of email/reset tokens. The raw token goes in the
  // email; a DB read alone can no longer be used to verify or reset any account.
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async verifyEmail(token: string) {
    const user = await this.usersRepo.findOne({
      where: { verificationToken: this.hashToken(token) },
    });
    if (!user) throw new NotFoundException('Invalid verification token');

    if (user.verificationExpires < new Date()) {
      throw new ForbiddenException('Verification token expired');
    }

    await this.usersRepo.update(user.id, {
      isVerified: true,
      verificationToken: null as any,
      verificationExpires: null as any,
      status: 'active',
    });

    return { message: 'Email verified successfully' };
  }

  async resendVerification(email: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) return { message: 'If the account exists and is not verified, a new verification email will be sent' };

    if (user.isVerified) {
      return { message: 'Email already verified' };
    }

    const verificationToken = randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.usersRepo.update(user.id, {
      verificationToken: this.hashToken(verificationToken),
      verificationExpires,
    });

    await this.mailService.sendVerificationEmail(email, verificationToken);
    return { message: 'Verification email sent' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) return { message: 'If the email exists, a reset link will be sent' };

    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

    await this.usersRepo.update(user.id, {
      resetToken: this.hashToken(resetToken),
      resetTokenExpires,
    });

    await this.mailService.sendPasswordResetEmail(email, resetToken);
    return { message: 'If the email exists, a reset link will be sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersRepo.findOne({
      where: { resetToken: this.hashToken(token) },
    });
    if (!user) throw new NotFoundException('Invalid reset token');

    if (user.resetTokenExpires < new Date()) {
      throw new ForbiddenException('Reset token expired');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.usersRepo.update(user.id, {
      passwordHash,
      resetToken: null as any,
      resetTokenExpires: null as any,
      failedLoginAttempts: 0,
      lockedUntil: null as any,
    });

    await this.sessionsRepo.delete({ userId: user.id });
    await this.mailService.sendPasswordChangedEmail(user.email);

    return { message: 'Password reset successfully' };
  }

  // Change password for a logged-in user: verify the current password, then set
  // the new one. Other sessions are revoked so a stolen session can't outlive a
  // password change (#731).
  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.usersRepo.update(user.id, { passwordHash });
    await this.sessionsRepo.delete({ userId: user.id });
    await this.mailService.sendPasswordChangedEmail(user.email);

    return { message: 'Password changed successfully' };
  }

  /**
   * Find the session for this refresh token and revoke it.
   * If the session was already revoked, it means the token is being reused —
   * a sign of theft — so revoke ALL sessions for that user.
   */
  async revokeTokenAndDetectReuse(refreshToken: string): Promise<void> {
    // Find all active+inactive sessions and check against the hash
    const sessions = await this.sessionsRepo.find({
      where: { isActive: true },
    });

    let matchedSession: Session | null = null;
    for (const session of sessions) {
      const match = await bcrypt.compare(refreshToken, session.refreshTokenHash);
      if (match) {
        matchedSession = session;
        break;
      }
    }

    if (!matchedSession) {
      // Token not found in active sessions — check revoked sessions for theft detection
      const allSessions = await this.sessionsRepo.find();
      for (const session of allSessions) {
        const match = await bcrypt.compare(refreshToken, session.refreshTokenHash);
        if (match) {
          // Token was previously revoked — possible theft, revoke everything
          await this.revokeAllSessions(session.userId);
          return;
        }
      }
      return;
    }

    // Session found and still active — mark as revoked
    await this.sessionsRepo.update(matchedSession.id, {
      isActive: false,
      revokedAt: new Date(),
    });
  }

  async refreshTokens(refreshToken: string, sessionId?: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      });
      if (payload.type !== 'refresh') throw new UnauthorizedException();

      // Detect token reuse before issuing new tokens (#497)
      await this.revokeTokenAndDetectReuse(refreshToken);

      const user = await this.usersRepo.findOne({ where: { id: payload.sub } });
      if (!user || user.isDeactivated) throw new UnauthorizedException();

      // Issue new refresh token and create a fresh session
      const newTokens = this.signTokens(user);
      const refreshTokenHash = await bcrypt.hash(newTokens.refreshToken, 12);
      const newSession = this.sessionsRepo.create({
        userId: user.id,
        refreshTokenHash,
        lastActive: new Date(),
      });
      await this.sessionsRepo.save(newSession);

      return newTokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string): Promise<{ message: string }> {
    const sessions = await this.sessionsRepo.find({
      where: { userId, isActive: true },
    });

    for (const session of sessions) {
      const match = await bcrypt.compare(refreshToken, session.refreshTokenHash);
      if (match) {
        await this.sessionsRepo.update(session.id, {
          isActive: false,
          revokedAt: new Date(),
        });
        break;
      }
    }

    return { message: 'Logged out successfully' };
  }

  async getSessions(userId: string) {
    const sessions = await this.sessionsRepo.find({
      where: { userId, isActive: true },
      order: { lastActive: 'DESC' },
      select: ['id', 'deviceName', 'browser', 'ipAddress', 'lastActive', 'createdAt'],
    });
    return sessions;
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.sessionsRepo.findOne({
      where: { id: sessionId, userId },
    });
    if (!session) throw new NotFoundException('Session not found');

    session.isActive = false;
    await this.sessionsRepo.save(session);
    return { message: 'Session revoked' };
  }

  async revokeAllSessions(userId: string, exceptCurrent?: string) {
    const query = this.sessionsRepo.createQueryBuilder()
      .where('user_id = :userId', { userId })
      .andWhere('is_active = :isActive', { isActive: true });

    if (exceptCurrent) {
      query.andWhere('id != :exceptCurrent', { exceptCurrent });
    }

    await query.update().set({ isActive: false }).execute();
    return { message: 'All sessions revoked' };
  }

  async setupTwoFactor(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Base32 secret + otpauth URI so standard authenticators can enroll (#743).
    // Do NOT enable 2FA yet — only persist the pending secret. 2FA turns on once
    // the user proves their authenticator works in verifyTwoFactorSetup, so a
    // failed/abandoned setup can never lock the account out (#759).
    const secret = generateTotpSecret();
    const otpauthUrl = buildOtpauthUrl(secret, user.email);

    await this.usersRepo.update(userId, {
      totpSecret: secret,
      twoFactorEnabled: false,
      twoFactorVerified: false,
    });

    return { secret, otpauthUrl, message: 'Scan the QR code, then verify a code to enable 2FA' };
  }

  async verifyTwoFactorSetup(userId: string, code: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user || !user.totpSecret) throw new NotFoundException('No 2FA setup in progress');

    const valid = verifyTotp(code, user.totpSecret);
    if (!valid) throw new UnauthorizedException('Invalid code');

    // Authenticator confirmed working → enable 2FA and issue one-time backup
    // codes (shown exactly once) so a lost device isn't a permanent lockout (#759).
    const { plain, hashes } = this.generateBackupCodes();
    await this.usersRepo.update(userId, {
      twoFactorEnabled: true,
      twoFactorVerified: true,
      twoFactorBackupCodes: JSON.stringify(hashes),
    });

    return {
      message: 'Two-factor authentication enabled',
      backupCodes: plain,
    };
  }

  async disableTwoFactor(userId: string, code: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user || !user.twoFactorEnabled) throw new ForbiddenException('2FA not enabled');

    // Accept an authenticator code OR a backup code, so a user without their
    // device can still turn 2FA off (#759).
    const valid = verifyTotp(code, user.totpSecret)
      || this.consumeBackupCode(code, user.twoFactorBackupCodes) !== null;
    if (!valid) throw new UnauthorizedException('Invalid code');

    await this.usersRepo.update(userId, {
      totpSecret: null as any,
      twoFactorEnabled: false,
      twoFactorVerified: false,
      twoFactorBackupCodes: null as any,
    });

    return { message: 'Two-factor authentication disabled' };
  }

  async regenerateBackupCodes(userId: string, code: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user || !user.twoFactorEnabled) throw new ForbiddenException('2FA not enabled');
    const valid = verifyTotp(code, user.totpSecret)
      || this.consumeBackupCode(code, user.twoFactorBackupCodes) !== null;
    if (!valid) throw new UnauthorizedException('Invalid code');
    const { plain, hashes } = this.generateBackupCodes();
    await this.usersRepo.update(userId, { twoFactorBackupCodes: JSON.stringify(hashes) });
    return { backupCodes: plain };
  }

  async deactivateAccount(userId: string) {
    await this.usersRepo.update(userId, { isDeactivated: true });
    return { message: 'Account deactivated' };
  }

  async reactivateAccount(
    email: string,
    password: string,
    deviceInfo?: { browser?: string; ip?: string; deviceName?: string },
  ) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    await this.usersRepo.update(user.id, { isDeactivated: false });
    // Invalidate any sessions that predate deactivation, then start a fresh one
    // and issue tokens so the controller's setAuthCookies actually logs the user
    // in (previously this returned a message only, leaving them unauthenticated — #146).
    await this.sessionsRepo.delete({ userId: user.id });
    await this.handleSuccessfulLogin(user, false, deviceInfo);

    return {
      ...this.signTokens(user),
      user: this.sanitizeUser(user),
      message: 'Account reactivated',
    };
  }

  async deleteAccount(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const scheduledDeletion = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await this.usersRepo.update(userId, { 
      deletedAt: scheduledDeletion,
      isDeactivated: true,
    });

    await this.mailService.sendAccountDeletionEmail(user.email);
    return { message: 'Account scheduled for deletion in 30 days' };
  }

  async cancelAccountDeletion(userId: string) {
    await this.usersRepo.update(userId, { deletedAt: null as any });
    return { message: 'Account deletion cancelled' };
  }

  async exportUserData(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        username: user.username,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        createdAt: user.createdAt,
      },
      exportedAt: new Date(),
    };
  }

  private signTokens(user: User, refreshExpiry = '7d') {
    const payload = { sub: user.id, role: user.accountType };
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }),
      refreshToken: this.jwtService.sign({ ...payload, type: 'refresh' }, { expiresIn: refreshExpiry }),
    };
  }

  private sanitizeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      username: user.username,
      isVerified: user.isVerified,
      twoFactorEnabled: user.twoFactorEnabled,
    };
  }

  // Front-end base URL the OAuth callback redirects back to once cookies are set.
  // Behind nginx the web app and API share an origin, so an empty base yields a
  // relative redirect (e.g. `/dashboard`) that lands on the web app. In dev they
  // run on different ports, so FRONTEND_URL must point at the web app (:3002).
  private frontendUrl(): string {
    const fromEnv =
      process.env.FRONTEND_URL ||
      process.env.APP_URL ||
      process.env.WEB_URL ||
      (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',')[0].trim() : '') ||
      (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3002');
    return fromEnv.replace(/\/+$/, '');
  }

  /** Absolute (or same-origin relative) URL to send the browser to post-login. */
  oauthRedirectTarget(returnPath: string): string {
    const safe = returnPath && returnPath.startsWith('/') ? returnPath : '/dashboard';
    return `${this.frontendUrl()}${safe}`;
  }

  // Sign the post-login return path into a short-lived JWT used as the OAuth
  // `state`. This doubles as CSRF protection (the callback only accepts a state
  // we signed) and prevents open-redirect (only relative paths are honored).
  signOAuthState(returnPath: string): string {
    const safe = returnPath && returnPath.startsWith('/') ? returnPath : '/dashboard';
    return this.jwtService.sign({ ret: safe, type: 'oauth-state' }, { expiresIn: '10m' });
  }

  /** Verify the `state` and recover the return path; default to /dashboard. */
  verifyOAuthState(state: string): string {
    try {
      const payload: any = this.jwtService.verify(state, { secret: process.env.JWT_SECRET });
      if (payload.type !== 'oauth-state') return '/dashboard';
      return typeof payload.ret === 'string' && payload.ret.startsWith('/') ? payload.ret : '/dashboard';
    } catch {
      return '/dashboard';
    }
  }

  /** Build the provider consent-screen URL to redirect the user to. */
  getOAuthAuthorizationUrl(provider: 'google' | 'github', state: string): string {
    if (provider === 'google') {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const redirectUri = process.env.GOOGLE_REDIRECT_URI;
      if (!clientId || !redirectUri) {
        throw new ForbiddenException('Google login is not configured on the server');
      }
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'online',
        include_granted_scopes: 'true',
        prompt: 'select_account',
        state,
      });
      return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = process.env.GITHUB_REDIRECT_URI;
    if (!clientId || !redirectUri) {
      throw new ForbiddenException('GitHub login is not configured on the server');
    }
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'read:user user:email',
      state,
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async handleOAuthCallback(provider: 'google' | 'github', code: string) {
    if (!code) throw new UnauthorizedException('Missing OAuth authorization code');

    let oauthUser: { email: string; name: string; id: string };

    if (provider === 'google') {
      oauthUser = await this.getGoogleUser(code);
    } else {
      oauthUser = await this.getGithubUser(code);
    }

    // Never proceed without a verified email. Without this guard a failed token
    // exchange yields `email: undefined`, and findOne({ email: undefined })
    // matches the FIRST user in the table — logging the visitor into a random
    // account. (This is the bug behind the "random user" Google login.)
    if (!oauthUser?.email) {
      throw new UnauthorizedException(`Could not retrieve an email from ${provider}`);
    }

    let user = await this.usersRepo.findOne({ where: { email: oauthUser.email } });

    if (!user) {
      const nameParts = oauthUser.name.split(' ');
      user = this.usersRepo.create({
        email: oauthUser.email,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        fullName: oauthUser.name,
        oauthProvider: provider,
        oauthId: oauthUser.id,
        isVerified: true,
        status: 'active',
      });
      await this.usersRepo.save(user);
    } else if (!user.oauthProvider) {
      await this.usersRepo.update(user.id, {
        oauthProvider: provider,
        oauthId: oauthUser.id,
      });
    }

    const deviceInfo = { browser: 'OAuth', ip: '0.0.0.0', deviceName: 'OAuth login' };
    await this.handleSuccessfulLogin(user, false, deviceInfo);

    return {
      ...this.signTokens(user),
      user: this.sanitizeUser(user),
    };
  }

  private async getGoogleUser(code: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri || '',
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;

    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userData = await userResponse.json();
    return { email: userData.email, name: userData.name, id: userData.id };
  }

  private async getGithubUser(code: string) {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const redirectUri = process.env.GITHUB_REDIRECT_URI;

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;

    const userResponse = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userData = await userResponse.json();

    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const emails = await emailResponse.json();
    const primaryEmail = emails.find((e: any) => e.primary)?.email || emails[0]?.email;

    return { email: primaryEmail, name: userData.name || userData.login, id: userData.id.toString() };
  }
}
