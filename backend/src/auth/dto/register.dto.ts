import { IsEmail, IsString, Matches, MinLength, MaxLength, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { Gender } from '../entities/user.entity';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^\+?[1-9]\d{6,14}$/, { message: 'phone must be a valid phone number' })
  phone: string;

  @IsString()
  @MinLength(8)
  @Matches(PASSWORD_REGEX, {
    message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  })
  password: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  // Username charset whitelist (no spaces/special chars) and length bounds
  // (#408, #409). This is the only place a username is set.
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'username may only contain letters, numbers, and underscores' })
  username?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;
}
