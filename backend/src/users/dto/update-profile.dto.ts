import { ArrayMaxSize, IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Max, MaxLength, Min, ValidateIf, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateProfileDto {
  // Basic — trim then reject a whitespace-only name (was accepted as blank, #733).
  @IsOptional() @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString() @IsNotEmpty({ message: 'Name cannot be empty' }) @MaxLength(100) fullName?: string;
  @IsOptional() @IsInt() @Min(18) @Max(80) age?: number;
  @IsOptional() @IsEnum(['male', 'female']) gender?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() socialStatus?: string;
  @IsOptional() @IsInt() @Min(0) childrenCount?: number;
  @IsOptional() @IsString() @MaxLength(500) bio?: string;
  @IsOptional() @IsString() avatarUrl?: string;
  @IsOptional() @IsString() coverUrl?: string;
  // Reject javascript:/data: URIs (stored XSS); only http(s) with a protocol.
  // ValidateIf skips empty string so clearing the field still saves.
  @IsOptional() @ValidateIf((o) => !!o.website) @IsUrl({ protocols: ['http', 'https'], require_protocol: true }) website?: string;
  @IsOptional() @IsString() relationshipStatus?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() workplace?: string;
  @IsOptional() @IsEnum(['public', 'friends', 'only_me']) introVisibility?: string;
  // Photo privacy (#752)
  @IsOptional() @IsEnum(['public', 'matches_only', 'on_request', 'private']) photoVisibility?: string;
  // Incognito browsing (#757)
  @IsOptional() @IsBoolean() incognito?: boolean;

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

  // Extended profile
  @IsOptional() @IsEnum(['healthy', 'has_condition']) healthStatus?: string;
  @IsOptional() @IsEnum(['employee', 'business_owner', 'retired', 'other']) employmentType?: string;
  @IsOptional() @IsString() @MaxLength(100) settleCountry?: string;
  @IsOptional() @IsEnum(['none', 'juz_amma', 'several_juz', 'half_or_more', 'complete']) quranMemorization?: string;
  @IsOptional() @IsEnum(['rarely', 'friday_only', 'weekly', 'daily']) mosqueAttendance?: string;
  @IsOptional() @IsEnum(['life', 'health', 'none']) insuranceType?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(50) @IsString({ each: true }) @MaxLength(60, { each: true }) interests?: string[];
  @IsOptional() @IsArray() @ArrayMaxSize(50) @IsString({ each: true }) @MaxLength(60, { each: true }) skills?: string[];
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
