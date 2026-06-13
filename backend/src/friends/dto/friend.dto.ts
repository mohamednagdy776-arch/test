import { IsEnum, IsOptional, IsString, IsArray, IsUUID, IsBoolean } from 'class-validator';
import { FriendshipStatus, FriendListType } from '../entities/friendship.entity';

export class SendFriendRequestDto {
  @IsUUID('4')
  userId: string;
}

export class RespondToFriendRequestDto {
  @IsEnum(FriendshipStatus)
  action: FriendshipStatus.ACCEPTED | FriendshipStatus.DECLINED;
}

export class CreateFriendListDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(FriendListType)
  type?: FriendListType;
}

export class UpdateFriendListDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  memberIds?: string[];
}

export class BlockUserDto {
  @IsUUID('4')
  userId: string;
}

export class RestrictUserDto {
  @IsUUID('4')
  userId: string;

  @IsOptional()
  @IsBoolean()
  restrictPosts?: boolean;

  @IsOptional()
  @IsBoolean()
  restrictMessages?: boolean;
}