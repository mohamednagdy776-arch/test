import { Body, Controller, Get, Headers, Post, Put, UseGuards, Req, Res, HttpCode, Query, Logger } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { setAuthCookies, clearAuthCookies } from '../cookie.util';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { SetupTwoFactorDto, DisableTwoFactorDto, RegenerateBackupCodesDto } from '../dto/two-factor.dto';
import { ChangeEmailDto, ConfirmEmailChangeDto } from '../dto/change-email.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ok } from '../../common/response.helper';
import { LoginThrottle } from '../../common/decorators/throttle.decorator';
import { parseUserAgent } from '../utils/user-agent';

// Tighter rate limit on auth endpoints (brute-force / mass-signup / email
// bombing protection) — 10 requests/minute/IP, vs the global 100. (#14/#88)
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 10, ttl: 60000 } })
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.register(dto);
    setAuthCookies(res, tokens as any);
    return ok(tokens, 'Registered successfully. Please verify your email.');
  }

  @Post('login')
  @LoginThrottle()
  async login(@Body() dto: LoginDto, @Req() req: any, @Res({ passthrough: true }) res: Response) {
    // Derive real device info from the request so new-device security emails are
    // meaningful (was hardcoded 'Unknown').
    const ua = (req?.headers?.['user-agent'] as string) || '';
    // Parse the UA into a friendly browser + device label instead of storing the
    // raw UA string in both columns (#732).
    const { browser, device } = parseUserAgent(ua);
    const deviceInfo = {
      browser,
      ip: (req?.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req?.ip || '0.0.0.0',
      deviceName: device,
    };
    const result = await this.authService.login(dto, deviceInfo);
    // Sets cookies only when tokens are present (skipped when 2FA is required).
    setAuthCookies(res, result as any);
    return ok(result, 'Login successful');
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    const result = await this.authService.verifyEmail(dto.token);
    return ok(result, 'Email verified successfully');
  }

  @Post('resend-verification')
  async resendVerification(@Body() body: { email: string }) {
    const result = await this.authService.resendVerification(body.email);
    return ok(result, 'Verification email sent if account exists and is not verified');
  }

  @Get('verify-email')
  async verifyEmailGet(@Query('token') token: string) {
    const result = await this.authService.verifyEmail(token);
    return ok(result, 'Email verified successfully');
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(dto.email);
    return ok(result, 'Password reset link sent if email exists');
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const result = await this.authService.resetPassword(dto.token, dto.password);
    return ok(result, 'Password reset successfully');
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() dto: RefreshTokenDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.refreshTokens(dto.refreshToken);
    setAuthCookies(res, result as any);
    return ok(result);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    clearAuthCookies(res);
    return ok(null, 'Logged out');
  }

  @Get('sessions')
  @UseGuards(AuthGuard('jwt'))
  async getSessions(@Req() req: any) {
    const sessions = await this.authService.getSessions(req.user.id);
    return ok(sessions);
  }

  @Post('sessions/revoke')
  @UseGuards(AuthGuard('jwt'))
  async revokeSession(@Body() body: { sessionId?: string; all?: boolean }, @Req() req: any) {
    if (body.all) {
      await this.authService.revokeAllSessions(req.user.id);
    } else if (body.sessionId) {
      await this.authService.revokeSession(req.user.id, body.sessionId);
    }
    return ok(null, 'Session(s) revoked');
  }

  @Post('2fa/setup')
  @UseGuards(AuthGuard('jwt'))
  async setupTwoFactor(@Req() req: any) {
    const result = await this.authService.setupTwoFactor(req.user.id);
    return ok(result);
  }

  @Post('2fa/verify')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  async verifyTwoFactor(@Body() dto: SetupTwoFactorDto, @Req() req: any) {
    const result = await this.authService.verifyTwoFactorSetup(req.user.id, dto.code);
    return ok(result);
  }

  @Post('2fa/disable')
  @UseGuards(AuthGuard('jwt'))
  async disableTwoFactor(@Body() dto: DisableTwoFactorDto, @Req() req: any) {
    const result = await this.authService.disableTwoFactor(req.user.id, dto.code);
    return ok(result);
  }

  @Post('2fa/backup-codes')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  async regenerateBackupCodes(@Body() dto: RegenerateBackupCodesDto, @Req() req: any) {
    const result = await this.authService.regenerateBackupCodes(req.user.id, dto.code);
    return ok(result);
  }

  @Post('2fa/verify-login')
  @HttpCode(200)
  async verifyLogin2FA(@Body() body: { preAuthToken: string; code: string }, @Res({ passthrough: true }) res: Response) {
    const deviceInfo = { browser: 'Unknown', ip: '0.0.0.0', deviceName: 'Unknown device' };
    const result = await this.authService.verifyTwoFactor(body.preAuthToken, body.code, deviceInfo);
    setAuthCookies(res, result as any);
    return ok(result);
  }

  @Post('deactivate')
  @UseGuards(AuthGuard('jwt'))
  async deactivate(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.deactivateAccount(req.user.id);
    clearAuthCookies(res);
    return ok(result);
  }

  @Post('reactivate')
  async reactivate(@Body() body: { email: string; password: string }, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.reactivateAccount(body.email, body.password);
    setAuthCookies(res, result as any);
    return ok(result, 'Account reactivated');
  }

  // Change password while logged in. The web settings form posted to this route
  // but it never existed server-side (404). Verifies the old password and
  // enforces complexity via ChangePasswordDto (#731).
  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return ok(await this.authService.changePassword(req.user.id, dto.oldPassword, dto.newPassword), 'Password changed');
  }

  // Request an email change — emails a verification link to the new address (#454).
  @Post('change-email')
  @UseGuards(AuthGuard('jwt'))
  async changeEmail(@Req() req: any, @Body() dto: ChangeEmailDto) {
    return ok(await this.authService.requestEmailChange(req.user.id, dto.newEmail, dto.currentPassword));
  }

  // Confirm the change from the emailed link; sessions are invalidated so the
  // user must re-log in — clear cookies here too.
  @Post('change-email/confirm')
  async confirmEmailChange(@Body() dto: ConfirmEmailChangeDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.confirmEmailChange(dto.token);
    clearAuthCookies(res);
    return ok(result);
  }

  @Post('delete')
  @UseGuards(AuthGuard('jwt'))
  async deleteAccount(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.deleteAccount(req.user.id);
    clearAuthCookies(res);
    return ok(result, 'Account scheduled for deletion');
  }

  @Post('delete/cancel')
  @UseGuards(AuthGuard('jwt'))
  async cancelDeletion(@Req() req: any) {
    const result = await this.authService.cancelAccountDeletion(req.user.id);
    return ok(result);
  }

  @Get('export')
  @UseGuards(AuthGuard('jwt'))
  async exportData(@Req() req: any) {
    const result = await this.authService.exportUserData(req.user.id);
    return ok(result);
  }

  // Step 1 — kick off the OAuth flow: redirect the browser to Google's consent
  // screen. `return` is where to land in the web app afterwards; it's signed into
  // the `state` param so the callback can recover it (and reject forged states).
  @Get('oauth/google/start')
  oauthGoogleStart(@Query('return') ret: string, @Res() res: Response) {
    const state = this.authService.signOAuthState(ret);
    return res.redirect(this.authService.getOAuthAuthorizationUrl('google', state));
  }

  // Step 2 — Google redirects back here with `code` + `state`. Exchange the code,
  // set the auth cookies, then redirect the browser back INTO the web app. (It
  // used to return JSON, which is why the tokens were dumped as raw text.)
  @Get('oauth/google')
  async oauthGoogle(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    const returnPath = this.authService.verifyOAuthState(state);
    // Google denied the request (e.g. app in "Testing" mode + non-test user, or
    // the user cancelled). Surface the real reason instead of a generic failure.
    if (error) {
      this.logger.warn(`Google OAuth denied at consent: ${error}`);
      return res.redirect(this.authService.oauthRedirectTarget(`/login?error=oauth&reason=${encodeURIComponent(error)}`));
    }
    try {
      const result = await this.authService.handleOAuthCallback('google', code);
      setAuthCookies(res, result as any);
      return res.redirect(this.authService.oauthRedirectTarget(returnPath));
    } catch (e: any) {
      // Log the real cause (token-exchange failure, missing email, etc.) so an
      // OAuth failure is diagnosable instead of a silent ?error=oauth.
      this.logger.error(`Google OAuth callback failed: ${e?.message || e}`);
      return res.redirect(this.authService.oauthRedirectTarget('/login?error=oauth'));
    }
  }

  @Get('oauth/github/start')
  oauthGithubStart(@Query('return') ret: string, @Res() res: Response) {
    const state = this.authService.signOAuthState(ret);
    return res.redirect(this.authService.getOAuthAuthorizationUrl('github', state));
  }

  @Get('oauth/github')
  async oauthGithub(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    const returnPath = this.authService.verifyOAuthState(state);
    try {
      const result = await this.authService.handleOAuthCallback('github', code);
      setAuthCookies(res, result as any);
      return res.redirect(this.authService.oauthRedirectTarget(returnPath));
    } catch {
      return res.redirect(this.authService.oauthRedirectTarget('/login?error=oauth'));
    }
  }
}