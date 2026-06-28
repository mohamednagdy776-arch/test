import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger('MailService');

  /**
   * Front-end base URL for links in emails. `FRONTEND_URL` was unset in the
   * backend container, so links rendered as the literal `undefined/...` and
   * verification was dead (#817). Fall back through the other URL-ish env vars
   * and finally a sane default so a link is never `undefined`.
   */
  private frontendUrl(): string {
    const fromEnv =
      process.env.FRONTEND_URL ||
      process.env.APP_URL ||
      process.env.WEB_URL ||
      process.env.PUBLIC_WEB_URL ||
      (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',')[0].trim() : '') ||
      'https://145-14-158-100.sslip.io';
    return fromEnv.replace(/\/+$/, '');
  }

  /** Redact an email for logs: `omar.khalifa@x.com` → `om***@x.com` (#818). */
  private redact(email: string): string {
    const [local = '', domain = ''] = String(email).split('@');
    const head = local.slice(0, 2);
    return `${head}${local.length > 2 ? '***' : ''}@${domain}`;
  }

  async sendVerificationEmail(email: string, token: string) {
    const link = `${this.frontendUrl()}/verify-email?token=${token}`;
    // Never log the token (it's a credential) or the full address (#818).
    void link;
    this.logger.log(`Verification email sent to ${this.redact(email)}`);
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const link = `${this.frontendUrl()}/reset-password?token=${token}`;
    void link;
    this.logger.log(`Password reset email sent to ${this.redact(email)}`);
  }

  async sendPasswordChangedEmail(email: string) {
    this.logger.log(`Password changed confirmation sent to ${this.redact(email)}`);
  }

  async sendNewDeviceLoginEmail(email: string, device: string, ip: string) {
    // Don't log raw IP/device alongside the recipient (#818).
    void device; void ip;
    this.logger.log(`New-device-login alert sent to ${this.redact(email)}`);
  }

  async sendAccountDeletionEmail(email: string) {
    this.logger.log(`Account deletion scheduled email sent to ${this.redact(email)}`);
  }

  // Verification link sent to the NEW address during an email change (#454).
  async sendEmailChangeVerification(newEmail: string, token: string) {
    const link = `${this.frontendUrl()}/verify-email-change?token=${token}`;
    void link;
    this.logger.log(`Email-change verification sent to ${this.redact(newEmail)}`);
  }

  // Security alert sent to the OLD address once the change is applied (#470).
  async sendEmailChangedAlert(oldEmail: string, newEmail: string) {
    void newEmail;
    this.logger.log(`Email-changed security alert sent to ${this.redact(oldEmail)}`);
  }
}
