import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  content: string;

  // If provided, this is a reply to another comment
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
