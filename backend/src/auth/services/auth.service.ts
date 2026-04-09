import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';
import { User } from '../entities/user.entity';
import { Session } from '../entities/session.entity';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Session) private sessionsRepo: Repository<Session>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already registered');

    const usernameExists = dto.username ? await this.usersRepo.findOne({ where: { username: dto.username } }) : null;
    if (usernameExists) throw new ConflictException('Username already taken');

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
      verificationToken,
      verificationExpires,
      status: 'pending',
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

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      await this.handleFailedLogin(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.twoFactorEnabled && !user.twoFactorVerified) {
      return { requiresTwoFactor: true, userId: user.id };
    }

    await this.handleSuccessfulLogin(user, dto.rememberMe, deviceInfo);

    return {
      ...this.signTokens(user, dto.rememberMe ? '30d' : '7d'),
      user: this.sanitizeUser(user),
    };
  }

  async verifyTwoFactor(userId: string, code: string, deviceInfo?: { browser?: string; ip?: string; deviceName?: string }) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user || !user.twoFactorEnabled) throw new UnauthorizedException();

    const valid = this.verifyTotp(code, user.totpSecret);
    if (!valid) throw new UnauthorizedException('Invalid code');

    await this.usersRepo.update(userId, { twoFactorVerified: true });
    await this.handleSuccessfulLogin(user, false, deviceInfo);

    return {
      ...this.signTokens(user),
      user: this.sanitizeUser(user),
    };
  }

  private verifyTotp(code: string, secret: string): boolean {
    const crypto = require('crypto');
    const epoch = Math.floor(Date.now() / 1000);
    const timeSlots = [epoch, epoch - 30, epoch + 30];

    for (const slot of timeSlots) {
      const hmac = crypto.createHmac('sha1', secret);
      hmac.update(slot.toString());
      const hash = hmac.digest('hex');
      const codeInt = parseInt(hash.slice(-8), 16);
      const totp = (codeInt % 1000000).toString().padStart(6, '0');
      if (totp === code) return true;
    }
    return false;
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

  async verifyEmail(token: string) {
    const user = await this.usersRepo.findOne({
      where: { verificationToken: token },
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
      verificationToken,
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
      resetToken,
      resetTokenExpires,
    });

    await this.mailService.sendPasswordResetEmail(email, resetToken);
    return { message: 'If the email exists, a reset link will be sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersRepo.findOne({
      where: { resetToken: token },
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

  async refreshTokens(refreshToken: string, sessionId?: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      });
      if (payload.type !== 'refresh') throw new UnauthorizedException();

      let session: Session | null = null;
      if (sessionId) {
        session = await this.sessionsRepo.findOne({ where: { id: sessionId, isActive: true } });
        if (session) {
          const valid = await bcrypt.compare(refreshToken, session.refreshTokenHash);
          if (!valid) throw new UnauthorizedException();
        }
      }

      const user = await this.usersRepo.findOne({ where: { id: payload.sub } });
      if (!user || user.isDeactivated) throw new UnauthorizedException();

      await this.sessionsRepo.update(session?.id || '', { lastActive: new Date() });

      return this.signTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
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

    const crypto = require('crypto');
    const secret = crypto.randomBytes(20).toString('base64');

    await this.usersRepo.update(userId, {
      totpSecret: secret,
      twoFactorEnabled: true,
      twoFactorVerified: false,
    });

    return { secret, message: 'Two-factor authentication enabled' };
  }

  async verifyTwoFactorSetup(userId: string, code: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user || !user.totpSecret) throw new NotFoundException('No 2FA setup in progress');

    const valid = this.verifyTotp(code, user.totpSecret);
    if (!valid) throw new UnauthorizedException('Invalid code');

    await this.usersRepo.update(userId, { twoFactorVerified: true });
    return { message: 'Two-factor authentication verified' };
  }

  async disableTwoFactor(userId: string, code: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user || !user.twoFactorEnabled) throw new ForbiddenException('2FA not enabled');

    const valid = this.verifyTotp(code, user.totpSecret);
    if (!valid) throw new UnauthorizedException('Invalid code');

    await this.usersRepo.update(userId, {
      totpSecret: null as any,
      twoFactorEnabled: false,
      twoFactorVerified: false,
    });

    return { message: 'Two-factor authentication disabled' };
  }

  async deactivateAccount(userId: string) {
    await this.usersRepo.update(userId, { isDeactivated: true });
    return { message: 'Account deactivated' };
  }

  async reactivateAccount(email: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    await this.usersRepo.update(user.id, { isDeactivated: false });
    return { message: 'Account reactivated' };
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
      accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
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

  async handleOAuthCallback(provider: 'google' | 'github', code: string) {
    let oauthUser: { email: string; name: string; id: string };

    if (provider === 'google') {
      oauthUser = await this.getGoogleUser(code);
    } else {
      oauthUser = await this.getGithubUser(code);
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
