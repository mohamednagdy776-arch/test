import { IsEmail, IsString, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsBoolean()
  @IsOptional()
  rememberMe?: boolean;
}
