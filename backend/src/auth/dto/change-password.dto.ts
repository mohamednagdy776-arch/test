import { IsString, MinLength, Matches } from 'class-validator';

// See register.dto.ts PASSWORD_REGEX comment (#160) — whitelist was too strict.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export class ChangePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @MinLength(8)
  @Matches(PASSWORD_REGEX, {
    message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  })
  newPassword: string;
}
