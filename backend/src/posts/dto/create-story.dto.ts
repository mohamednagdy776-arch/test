import { IsOptional, IsString, IsIn, IsInt, Min, Max, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

// A story must carry something — media or text. The endpoint used to accept a
// completely empty body and return 201 for a blank story (#748); the "at least
// one of mediaUrl/text" rule is enforced in StoriesService.createStory.
export class CreateStoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  mediaUrl?: string;

  @IsOptional()
  @IsIn(['image', 'video'])
  mediaType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  thumbnailUrl?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(2000)
  text?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  bgColor?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  duration?: number;
}
