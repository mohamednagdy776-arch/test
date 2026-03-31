import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() fullName?: string;
  @IsOptional() @IsInt() @Min(18) age?: number;
  @IsOptional() @IsEnum(['male', 'female']) gender?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() socialStatus?: string;
  @IsOptional() @IsInt() @Min(0) childrenCount?: number;
}
