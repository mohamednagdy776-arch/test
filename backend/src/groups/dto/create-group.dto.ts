import { IsEnum, IsOptional, IsString } from 'class-validator';
import { GroupPrivacy } from '../entities/group.entity';

export class CreateGroupDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['public', 'private', 'secret'])
  privacy?: GroupPrivacy = 'public';

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
