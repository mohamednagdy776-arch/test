import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger('MailService');
  private transporter: nodemailer.Transporter | null | undefined;

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

  /**
   * Lazily build the SMTP transport from env (#47/#52/#56 — the service used to
   * only LOG, so no mail was ever sent). Returns null when SMTP isn't configured
   * so callers degrade to log-only instead of throwing.
   */
  private getTransporter(): nodemailer.Transporter | null {
    if (this.transporter !== undefined) return this.transporter ?? null;
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    if (!host || !user || !pass) {
      this.logger.warn('SMTP not configured (SMTP_HOST/USER/PASSWORD) — emails are logged only.');
      this.transporter = null;
      return null;
    }
    const port = Number(process.env.SMTP_PORT || 587);
    // 465 => implicit TLS; 587/25 => STARTTLS. SMTP_SECURE can override.
    const secure = process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === 'true'
      : port === 465;
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      // cPanel/self-hosted mail servers frequently present a self-signed cert;
      // default to tolerating it (own server), overridable for strictness.
      tls: { rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED === 'true' },
    });
    this.logger.log(`SMTP transport ready (${host}:${port}, secure=${secure}).`);
    return this.transporter;
  }

  private fromAddress(): string {
    const addr = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@tayyibt.com';
    const name = process.env.SMTP_FROM_NAME || 'طيبت';
    return `"${name}" <${addr}>`;
  }

  /** Wrap body content in a minimal RTL HTML shell. */
  private layout(title: string, bodyHtml: string): string {
    return `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"></head>
<body style="margin:0;background:#F0FDF4;font-family:Tahoma,Arial,sans-serif;color:#1F2937;">
  <div style="max-width:520px;margin:24px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #E5E7EB;">
    <div style="background:linear-gradient(135deg,#10B981,#059669);padding:20px 24px;color:#fff;font-size:20px;font-weight:bold;">طيبت</div>
    <div style="padding:24px;line-height:1.9;">
      <h2 style="margin:0 0 12px;font-size:18px;color:#111827;">${title}</h2>
      ${bodyHtml}
    </div>
    <div style="padding:16px 24px;color:#9CA3AF;font-size:12px;border-top:1px solid #F3F4F6;">هذه رسالة آلية من منصة طيبت.</div>
  </div>
</body></html>`;
  }

  private button(href: string, label: string): string {
    return `<a href="${href}" style="display:inline-block;margin:12px 0;padding:12px 22px;background:#10B981;color:#fff;text-decoration:none;border-radius:12px;font-weight:bold;">${label}</a>
      <p style="font-size:12px;color:#6B7280;">أو انسخ هذا الرابط:<br><span style="word-break:break-all;">${href}</span></p>`;
  }

  /** Core send: uses SMTP when configured, otherwise logs (never throws). */
  private async send(to: string, subject: string, html: string, label: string): Promise<void> {
    const t = this.getTransporter();
    if (!t) {
      this.logger.log(`${label} (log-only, SMTP off) to ${this.redact(to)}`);
      return;
    }
    try {
      await t.sendMail({ from: this.fromAddress(), to, subject, html });
      this.logger.log(`${label} sent to ${this.redact(to)}`);
    } catch (err: any) {
      // Don't fail the request flow if mail delivery hiccups — log and move on.
      this.logger.error(`${label} FAILED to ${this.redact(to)}: ${err?.message || err}`);
    }
  }

  async sendVerificationEmail(email: string, token: string) {
    const link = `${this.frontendUrl()}/verify-email?token=${token}`;
    await this.send(email, 'تأكيد بريدك الإلكتروني — طيبت',
      this.layout('تأكيد بريدك الإلكتروني',
        `<p>أهلاً بك في طيبت! يرجى تأكيد بريدك الإلكتروني بالضغط على الزر أدناه.</p>${this.button(link, 'تأكيد البريد')}`),
      'Verification email');
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const link = `${this.frontendUrl()}/reset-password?token=${token}`;
    await this.send(email, 'إعادة تعيين كلمة المرور — طيبت',
      this.layout('إعادة تعيين كلمة المرور',
        `<p>طلبت إعادة تعيين كلمة المرور. اضغط الزر أدناه لتعيين كلمة مرور جديدة. الرابط صالح لمدة ساعة.</p>${this.button(link, 'إعادة التعيين')}<p style="font-size:12px;color:#6B7280;">إذا لم تطلب ذلك، تجاهل هذه الرسالة.</p>`),
      'Password reset email');
  }

  async sendPasswordChangedEmail(email: string) {
    await this.send(email, 'تم تغيير كلمة المرور — طيبت',
      this.layout('تم تغيير كلمة المرور',
        `<p>تم تغيير كلمة مرور حسابك بنجاح. إذا لم تقم بذلك، يرجى التواصل معنا فوراً.</p>`),
      'Password-changed email');
  }

  async sendNewDeviceLoginEmail(email: string, device: string, ip: string) {
    await this.send(email, 'تسجيل دخول من جهاز جديد — طيبت',
      this.layout('تسجيل دخول جديد',
        `<p>تم تسجيل الدخول إلى حسابك من:</p><p><b>الجهاز:</b> ${device}<br><b>عنوان IP:</b> ${ip}</p><p>إذا لم يكن أنت، غيّر كلمة المرور فوراً.</p>`),
      'New-device-login alert');
  }

  async sendAccountDeletionEmail(email: string) {
    await this.send(email, 'جدولة حذف الحساب — طيبت',
      this.layout('جدولة حذف الحساب',
        `<p>تم جدولة حذف حسابك خلال 30 يوماً. يمكنك التراجع بتسجيل الدخول قبل ذلك.</p>`),
      'Account-deletion email');
  }

  // Verification link sent to the NEW address during an email change (#454).
  async sendEmailChangeVerification(newEmail: string, token: string) {
    const link = `${this.frontendUrl()}/verify-email-change?token=${token}`;
    await this.send(newEmail, 'تأكيد تغيير البريد الإلكتروني — طيبت',
      this.layout('تأكيد تغيير البريد',
        `<p>لإكمال تغيير بريدك الإلكتروني إلى هذا العنوان، اضغط الزر أدناه.</p>${this.button(link, 'تأكيد العنوان الجديد')}`),
      'Email-change verification');
  }

  // Security alert sent to the OLD address once the change is applied (#470).
  async sendEmailChangedAlert(oldEmail: string, newEmail: string) {
    await this.send(oldEmail, 'تم تغيير بريدك الإلكتروني — طيبت',
      this.layout('تم تغيير البريد الإلكتروني',
        `<p>تم تغيير البريد الإلكتروني لحسابك إلى <b>${this.redact(newEmail)}</b>. إذا لم تقم بذلك، تواصل معنا فوراً.</p>`),
      'Email-changed alert');
  }
}
