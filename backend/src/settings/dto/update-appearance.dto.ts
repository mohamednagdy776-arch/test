import { IsIn, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateAppearanceDto {
  @IsIn(['light', 'dark', 'system'])
  @IsOptional()
  theme?: 'light' | 'dark' | 'system';

  @IsIn(['emerald', 'blue', 'purple', 'pink', 'orange'])
  @IsOptional()
  colorScheme?: 'emerald' | 'blue' | 'purple' | 'pink' | 'orange';

  @IsBoolean()
  @IsOptional()
  reducedMotion?: boolean;

  @IsBoolean()
  @IsOptional()
  highContrast?: boolean;

  @IsBoolean()
  @IsOptional()
  largeText?: boolean;

  @IsString()
  @IsOptional()
  fontFamily?: string;
}
