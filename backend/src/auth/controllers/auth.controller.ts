import { Body, Controller, Get, Headers, Post, Put, UseGuards, Req, HttpCode, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { SetupTwoFactorDto, DisableTwoFactorDto } from '../dto/two-factor.dto';
import { ok } from '../../common/response.helper';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const tokens = await this.authService.register(dto);
    return ok(tokens, 'Registered successfully. Please verify your email.');
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const deviceInfo = {
      browser: 'Unknown',
      ip: '0.0.0.0',
      deviceName: 'Unknown device',
    };
    const result = await this.authService.login(dto, deviceInfo);
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
  async refresh(@Body() dto: RefreshTokenDto) {
    const result = await this.authService.refreshTokens(dto.refreshToken);
    return ok(result);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req: any) {
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

  @Post('2fa/verify-login')
  @HttpCode(200)
  async verifyLogin2FA(@Body() body: { userId: string; code: string }) {
    const deviceInfo = { browser: 'Unknown', ip: '0.0.0.0', deviceName: 'Unknown device' };
    const result = await this.authService.verifyTwoFactor(body.userId, body.code, deviceInfo);
    return ok(result);
  }

  @Post('deactivate')
  @UseGuards(AuthGuard('jwt'))
  async deactivate(@Req() req: any) {
    const result = await this.authService.deactivateAccount(req.user.id);
    return ok(result);
  }

  @Post('reactivate')
  async reactivate(@Body() body: { email: string; password: string }) {
    const result = await this.authService.reactivateAccount(body.email, body.password);
    return ok(result, 'Account reactivated');
  }

  @Post('delete')
  @UseGuards(AuthGuard('jwt'))
  async deleteAccount(@Req() req: any) {
    const result = await this.authService.deleteAccount(req.user.id);
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

  @Get('oauth/google')
  async oauthGoogle(@Req() req: any) {
    const code = req.query.code as string;
    const result = await this.authService.handleOAuthCallback('google', code);
    return ok(result, 'Google login successful');
  }

  @Get('oauth/github')
  async oauthGithub(@Req() req: any) {
    const code = req.query.code as string;
    const result = await this.authService.handleOAuthCallback('github', code);
    return ok(result, 'GitHub login successful');
  }
}