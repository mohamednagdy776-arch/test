import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class SetupTwoFactorDto {
  @IsString()
  code: string;
}

export class VerifyTwoFactorDto {
  @IsString()
  code: string;
}

export class DisableTwoFactorDto {
  @IsString()
  code: string;
}
