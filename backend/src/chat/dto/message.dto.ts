import { IsString, IsUUID, IsOptional } from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  conversationId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsUUID()
  replyToId?: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsString()
  storySnapshotUrl?: string;
}

export class EditMessageDto {
  // messageId comes from the path param — optional in the body.
  @IsOptional()
  @IsUUID()
  messageId?: string;

  @IsString()
  content: string;
}

export class DeleteMessageDto {
  @IsOptional()
  @IsUUID()
  messageId?: string;

  @IsOptional()
  deleteForEveryone?: boolean;
}

export class ReactMessageDto {
  @IsOptional()
  @IsUUID()
  messageId?: string;

  @IsString()
  emoji: string;
}

export class ForwardMessageDto {
  @IsOptional()
  @IsUUID()
  messageId?: string;

  @IsUUID()
  targetConversationId: string;
}

export class SearchMessageDto {
  // conversationId comes from the path param — optional in the query.
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @IsString()
  query: string;
}