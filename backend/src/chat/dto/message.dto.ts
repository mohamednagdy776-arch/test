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
}

export class EditMessageDto {
  @IsUUID()
  messageId: string;

  @IsString()
  content: string;
}

export class DeleteMessageDto {
  @IsUUID()
  messageId: string;

  @IsOptional()
  deleteForEveryone?: boolean;
}

export class ReactMessageDto {
  @IsUUID()
  messageId: string;

  @IsString()
  emoji: string;
}

export class ForwardMessageDto {
  @IsUUID()
  messageId: string;

  @IsUUID()
  targetConversationId: string;
}

export class SearchMessageDto {
  @IsUUID()
  conversationId: string;

  @IsString()
  query: string;
}