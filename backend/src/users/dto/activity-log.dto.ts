import { IsEnum, IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';

export class ActivityLogQueryDto {
  @IsOptional() @IsNumber() page?: number;
  @IsOptional() @IsNumber() limit?: number;
  @IsOptional() @IsString() year?: string;
  @IsOptional() @IsEnum(['post', 'like', 'comment', 'tag', 'friend_add', 'photo', 'video']) type?: string;
}
