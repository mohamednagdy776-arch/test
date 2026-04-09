import { IsEnum, IsOptional, IsString, IsUUID, IsBoolean } from 'class-validator';
import { CommentReactionType } from '../entities/comment-reaction.entity';

export class CreateCommentDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateCommentDto {
  @IsString()
  content: string;
}

export class ReactToCommentDto {
  @IsEnum(CommentReactionType)
  type: CommentReactionType;
}

export class PinCommentDto {
  @IsBoolean()
  isPinned: boolean;
}