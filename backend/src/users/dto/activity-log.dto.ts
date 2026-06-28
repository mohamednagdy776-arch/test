import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

// Treat empty-string query params as absent so `?year=&type=` (the client's
// "all years / all activities" default) doesn't fail validation with a 400
// (#832).
const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' || value === null ? undefined : value;

export class ActivityLogQueryDto {
  @IsOptional() @IsNumber() page?: number;
  @IsOptional() @IsNumber() limit?: number;
  @IsOptional() @Transform(emptyToUndefined) @IsString() year?: string;
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsEnum(['post', 'like', 'comment', 'tag', 'friend_add', 'photo', 'video'])
  type?: string;
}
