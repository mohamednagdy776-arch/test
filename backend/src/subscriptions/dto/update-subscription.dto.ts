import { IsIn, IsOptional } from 'class-validator';

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsIn(['free', 'premium'])
  plan?: 'free' | 'premium';

  @IsOptional()
  @IsIn(['active', 'cancelled', 'expired'])
  status?: string;
}
