import { IsDateString, IsIn, IsOptional } from 'class-validator';

export class CreateSubscriptionDto {
  // The upgrade page offers a third "family" plan (عائلي) that this DTO never
  // accepted, so subscribing to it always 400'd with "plan must be one of the
  // following values: free, premium" (#82, #148).
  @IsIn(['free', 'premium', 'family'])
  plan: 'free' | 'premium' | 'family';

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
