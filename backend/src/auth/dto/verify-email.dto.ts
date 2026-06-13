import { IsString, Length, Matches } from 'class-validator';

export class VerifyEmailDto {
  // Verification tokens are randomBytes(32).toString('hex') = exactly 64 hex
  // chars. Reject anything else early instead of doing a DB lookup on arbitrary
  // (potentially multi-megabyte) input.
  @IsString()
  @Length(64, 64)
  @Matches(/^[0-9a-f]{64}$/, { message: 'Invalid token format' })
  token: string;
}
