import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSavedSearchDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}
