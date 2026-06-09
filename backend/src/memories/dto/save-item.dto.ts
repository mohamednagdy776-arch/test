import { IsString, IsIn, IsOptional } from 'class-validator';

export class SaveItemDto {
  @IsIn(['post', 'comment', 'video', 'story'])
  entityType: 'post' | 'comment' | 'video' | 'story';

  @IsString()
  entityId: string;

  @IsOptional()
  @IsString()
  collectionId?: string;
}

export class CreateCollectionDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  coverImage?: string;
}

export class UpdateCollectionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;
}