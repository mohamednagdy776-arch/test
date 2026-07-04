import { IsString, IsOptional, IsInt, Min } from 'class-validator';
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
}