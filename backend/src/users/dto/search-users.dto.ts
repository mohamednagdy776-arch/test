import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchUsersDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEnum(['male', 'female']) gender?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() sect?: string;
  @IsOptional() @IsString() lifestyle?: string;
  @IsOptional() @IsString() education?: string;
  @IsOptional() @IsString() prayerLevel?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(18) minAge?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Max(80) maxAge?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) limit?: number = 20;
}
