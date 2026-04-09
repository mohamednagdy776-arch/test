import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUrl, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

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
  @IsOptional() @IsString() coverUrl?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() relationshipStatus?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() workplace?: string;
  @IsOptional() @IsEnum(['public', 'friends', 'only_me']) introVisibility?: string;

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

export class ProfileWorkDto {
  @IsOptional() @IsString() id?: string;
  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsString() position?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() @IsBoolean() isCurrent?: boolean;
}

export class ProfileEducationDto {
  @IsOptional() @IsString() id?: string;
  @IsOptional() @IsString() school?: string;
  @IsOptional() @IsString() degree?: string;
  @IsOptional() @IsString() fieldOfStudy?: string;
  @IsOptional() @IsString() startYear?: string;
  @IsOptional() @IsString() endYear?: string;
}

export class UpdateProfileWithEntriesDto extends UpdateProfileDto {
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ProfileWorkDto)
  workEntries?: ProfileWorkDto[];

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ProfileEducationDto)
  educationEntries?: ProfileEducationDto[];
}
