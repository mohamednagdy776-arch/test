import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';

export class UpdateProfileDto {
  // Basic
  @IsOptional() @IsString() fullName?: string;
  @IsOptional() @IsInt() @Min(18) @Max(80) age?: number;
  @IsOptional() @IsEnum(['male', 'female']) gender?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() socialStatus?: string;
  @IsOptional() @IsInt() @Min(0) childrenCount?: number;
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString() avatarUrl?: string;

  // Details
  @IsOptional() @IsString() education?: string;
  @IsOptional() @IsString() jobTitle?: string;
  @IsOptional() @IsString() financialLevel?: string;
  @IsOptional() @IsString() culturalLevel?: string;
  @IsOptional() @IsString() lifestyle?: string;

  // Religious
  @IsOptional() @IsString() sect?: string;
  @IsOptional() @IsString() prayerLevel?: string;
  @IsOptional() @IsString() religiousCommitment?: string;

  // Preferences
  @IsOptional() @IsInt() @Min(18) minAge?: number;
  @IsOptional() @IsInt() @Max(80) maxAge?: number;
  @IsOptional() @IsString() preferredCountry?: string;
  @IsOptional() @IsBoolean() relocateWilling?: boolean;
  @IsOptional() @IsBoolean() wantsChildren?: boolean;
}
