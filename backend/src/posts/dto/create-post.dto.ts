import { IsArray, IsEnum, IsIn, IsOptional, IsString, IsDateString, IsNumber, IsBoolean } from 'class-validator';
import { PostType, Audience } from '../entities/post.entity';

export class CreatePostDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsIn(['image', 'video'])
  mediaType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
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

  @IsOptional()
  @IsArray()
  pollOptions?: { text: string; votes: number }[];

  @IsOptional()
  @IsString()
  originalPostId?: string;
}