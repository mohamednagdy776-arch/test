import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['public', 'private'])
  privacy?: 'public' | 'private' = 'public';
}
