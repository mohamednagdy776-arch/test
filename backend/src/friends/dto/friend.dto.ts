import { IsEnum, IsOptional, IsString, IsArray, IsUUID, IsBoolean } from 'class-validator';
import { FriendshipStatus, FriendListType } from '../entities/friendship.entity';

export class SendFriendRequestDto {
  @IsString()
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
  @IsString()
  userId: string;
}

export class RestrictUserDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsBoolean()
  restrictPosts?: boolean;

  @IsOptional()
  @IsBoolean()
  restrictMessages?: boolean;
}