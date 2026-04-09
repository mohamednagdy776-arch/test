import { IsString, IsOptional } from 'class-validator';

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
}