import { IsString, IsIn, IsOptional } from 'class-validator';

export class SaveItemDto {
  @IsIn(['post', 'comment', 'video', 'story'])
  entityType: 'post' | 'comment' | 'video' | 'story';

  @IsString()
  entityId: string;
}