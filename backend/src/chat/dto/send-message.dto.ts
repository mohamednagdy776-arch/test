import { IsString, IsUUID, IsOptional } from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  matchId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  type?: string;
}
