import { IsIn, IsBoolean, IsOptional, IsString } from 'class-validator';

export type PrivacyVisibility = 'public' | 'friends' | 'friends_of_friends' | 'only_me';

export class UpdatePrivacyDto {
  @IsIn(['public', 'friends', 'friends_of_friends', 'only_me'])
  @IsOptional()
  whoCanSeePosts?: PrivacyVisibility;

  @IsIn(['public', 'friends', 'friends_of_friends', 'only_me'])
  @IsOptional()
  whoCanSeeFriends?: PrivacyVisibility;

  @IsIn(['public', 'friends', 'friends_of_friends', 'only_me'])
  @IsOptional()
  whoCanSendFriendRequests?: PrivacyVisibility;

  @IsIn(['public', 'friends', 'friends_of_friends', 'only_me'])
  @IsOptional()
  whoCanSeeProfilePicture?: PrivacyVisibility;

  @IsIn(['public', 'friends', 'friends_of_friends', 'only_me'])
  @IsOptional()
  whoCanSeeCoverPhoto?: PrivacyVisibility;

  @IsIn(['public', 'friends', 'friends_of_friends', 'only_me'])
  @IsOptional()
  whoCanSeeBio?: PrivacyVisibility;

  @IsIn(['public', 'friends', 'friends_of_friends', 'only_me'])
  @IsOptional()
  whoCanTagMe?: PrivacyVisibility;

  @IsBoolean()
  @IsOptional()
  allowSearchEngines?: boolean;
}

export class BlockUserDto {
  @IsString()
  blockedUserId: string;
}

