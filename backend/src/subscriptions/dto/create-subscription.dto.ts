import { IsDateString, IsIn, IsOptional } from 'class-validator';

export class CreateSubscriptionDto {
  @IsIn(['free', 'premium'])
  plan: 'free' | 'premium';

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
