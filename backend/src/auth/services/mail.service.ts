import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  async sendVerificationEmail(email: string, token: string) {
    const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    console.log(`[EMAIL] Verification email to ${email}: ${link}`);
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    console.log(`[EMAIL] Password reset email to ${email}: ${link}`);
  }

  async sendPasswordChangedEmail(email: string) {
    console.log(`[EMAIL] Password changed confirmation to ${email}`);
  }

  async sendNewDeviceLoginEmail(email: string, device: string, ip: string) {
    console.log(`[EMAIL] New device login to ${email}: ${device} from ${ip}`);
  }

  async sendAccountDeletionEmail(email: string) {
    console.log(`[EMAIL] Account deletion scheduled for ${email}`);
  }

  // Verification link sent to the NEW address during an email change (#454).
  async sendEmailChangeVerification(newEmail: string, token: string) {
    const link = `${process.env.FRONTEND_URL}/verify-email-change?token=${token}`;
    console.log(`[EMAIL] Confirm email change to ${newEmail}: ${link}`);
  }

  // Security alert sent to the OLD address once the change is applied (#470).
  async sendEmailChangedAlert(oldEmail: string, newEmail: string) {
    console.log(`[EMAIL] Security alert to ${oldEmail}: account email changed to ${newEmail}`);
  }
}
