import { IsString, IsOptional, IsIn } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsIn(['friend_request', 'friend_accepted', 'like', 'comment', 'tag', 'share', 'mention', 'birthday', 'group_invite', 'event_invite', 'memory', 'story_view'])
  type: NotificationType;

  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  entityType?: string;

  @IsString()
  @IsOptional()
  entityId?: string;
}
