import { IsEnum, IsOptional, IsString, IsUUID, IsBoolean, IsNotEmpty, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { CommentReactionType } from '../entities/comment-reaction.entity';

// Trim leading/trailing whitespace so a whitespace-only comment (e.g. "   ")
// fails @IsNotEmpty instead of being stored as a blank comment (#744).
const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateCommentDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Comment cannot be empty' })
  @MaxLength(2000)
  content: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateCommentDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Comment cannot be empty' })
  @MaxLength(2000)
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