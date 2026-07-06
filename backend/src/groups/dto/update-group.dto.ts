import { IsEnum, IsOptional, IsString } from 'class-validator';
import { GroupPrivacy } from '../entities/group.entity';

export class UpdateGroupDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['public', 'private', 'secret'])
  privacy?: GroupPrivacy;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  coverPhoto?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  rules?: string;

  @IsOptional()
  @IsString()
  tags?: string;
}
