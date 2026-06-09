import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationSettingsDto {
  @IsBoolean()
  @IsOptional()
  notificationsEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  likesNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  commentsNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  friendRequestsNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  messagesNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  mentionsNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  pushNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  smsNotifications?: boolean;
}
