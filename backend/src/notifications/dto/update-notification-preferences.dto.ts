import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @IsBoolean()
  @IsOptional()
  newMatch?: boolean;

  @IsBoolean()
  @IsOptional()
  newMessage?: boolean;

  @IsBoolean()
  @IsOptional()
  postReaction?: boolean;

  @IsBoolean()
  @IsOptional()
  postComment?: boolean;

  @IsBoolean()
  @IsOptional()
  medicalResultReady?: boolean;

  @IsBoolean()
  @IsOptional()
  consentRequest?: boolean;

  @IsBoolean()
  @IsOptional()
  subscriptionEvents?: boolean;

  @IsBoolean()
  @IsOptional()
  labResultSubmitted?: boolean;

  @IsBoolean()
  @IsOptional()
  systemAnnouncements?: boolean;
}
