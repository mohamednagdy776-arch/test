import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSupportReportDto {
  @IsIn(['bug', 'feature', 'account', 'privacy', 'other'])
  type: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
