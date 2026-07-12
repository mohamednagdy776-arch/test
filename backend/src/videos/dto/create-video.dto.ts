import { IsString, IsOptional, IsInt, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVideoDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  url: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  duration?: number;

  // Reels had no upload entry point at all -- the composer never sent this,
  // so every uploaded video defaulted to a regular /watch video (#367).
  @IsBoolean()
  @IsOptional()
  isReel?: boolean;
}