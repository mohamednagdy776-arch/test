import { IsString, Length, Matches, MinLength } from 'class-validator';

// See register.dto.ts PASSWORD_REGEX comment (#160) — whitelist was too strict.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export class ResetPasswordDto {
  // Reset tokens are randomBytes(32).toString('hex') = exactly 64 hex chars.
  @IsString()
  @Length(64, 64)
  @Matches(/^[0-9a-f]{64}$/, { message: 'Invalid token format' })
  token: string;

  @IsString()
  @MinLength(8)
  @Matches(PASSWORD_REGEX, {
    message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  })
  password: string;
}
