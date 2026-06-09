import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNewsletterDto {
  @IsBoolean()
  @IsOptional()
  newsletterEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  weeklyDigest?: boolean;

  @IsBoolean()
  @IsOptional()
  newFeaturesUpdates?: boolean;

  @IsBoolean()
  @IsOptional()
  promotionsOffers?: boolean;

  @IsBoolean()
  @IsOptional()
  eventsAndCommunities?: boolean;

  @IsBoolean()
  @IsOptional()
  securityAlerts?: boolean;
}
