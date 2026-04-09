import { IsString, IsUUID, IsOptional, IsArray, Min, Max } from 'class-validator';

export class CreateGroupDto {
  @IsArray()
  @IsUUID('4', { each: true })
  participantIds: string[];

  @IsOptional()
  @IsString()
  name?: string;
}

export class UpdateGroupDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class AddParticipantDto {
  @IsUUID()
  userId: string;
}

export class RemoveParticipantDto {
  @IsUUID()
  userId: string;
}

export class UpdateParticipantRoleDto {
  @IsUUID()
  userId: string;

  @IsString()
  role: 'member' | 'admin';
}

export class MuteGroupDto {
  @IsUUID()
  conversationId: string;

  @IsOptional()
  duration?: number;
}

export class ToggleDisappearingDto {
  @IsUUID()
  conversationId: string;

  @IsOptional()
  enabled?: boolean;
}