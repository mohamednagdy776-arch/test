import { IsIn, IsOptional } from 'class-validator';

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsIn(['free', 'premium', 'family'])
  plan?: 'free' | 'premium' | 'family';

  @IsOptional()
  @IsIn(['active', 'cancelled', 'expired'])
  status?: string;
}
