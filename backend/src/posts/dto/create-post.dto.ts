import { IsArray, IsEnum, IsIn, IsOptional, IsString, IsDateString, IsNumber, IsBoolean, MaxLength, ArrayMaxSize, ValidateNested, IsInt, Min, Max, IsNotEmpty } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { PostType, Audience } from '../entities/post.entity';

class PollOptionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  text: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100_000_000)
  votes?: number;
}

export class CreatePostDto {
  @IsString()
  @MaxLength(10000)
  content: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsIn(['image', 'video'])
  mediaType?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(2048, { each: true })
  mediaUrls?: string[];

  @IsOptional()
  @IsEnum(PostType)
  postType?: PostType;

  @IsOptional()
  @IsEnum(Audience)
  audience?: Audience;

  @IsOptional()
  @IsString()
  bgColor?: string;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  feeling?: string;

  @IsOptional()
  @IsString()
  linkUrl?: string;

  @IsOptional()
  @IsString()
  linkTitle?: string;

  @IsOptional()
  @IsString()
  linkDescription?: string;

  @IsOptional()
  @IsString()
  linkImage?: string;

  // Set when the author explicitly removed the auto-detected link preview, so
  // the server skips Open Graph enrichment for this post.
  @IsOptional()
  @IsBoolean()
  noLinkPreview?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => PollOptionDto)
  pollOptions?: PollOptionDto[];

  @IsOptional()
  @IsString()
  originalPostId?: string;

  @IsOptional()
  @IsString()
  groupId?: string;
}

// Editing a post: every field optional, but only the whitelisted CreatePostDto
// fields are accepted. Previously updatePost took `body: any` straight into
// Object.assign, so callers could set arbitrary columns (latent mass-assignment)
// and blank a post to nothing (#748). The global ValidationPipe (whitelist:true)
// strips any field not declared here.
export class UpdatePostDto extends PartialType(CreatePostDto) {}