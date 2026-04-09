import { IsString, IsOptional, IsIn, IsDateString, IsArray } from 'class-validator';

export type EventPrivacy = 'public' | 'friends' | 'private';
export type RecurringType = 'daily' | 'weekly' | 'monthly' | 'custom' | null;

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  coverPhoto?: string;

  @IsIn(['public', 'friends', 'private'])
  @IsOptional()
  privacy?: EventPrivacy;

  @IsArray()
  @IsOptional()
  coHosts?: string[];

  @IsIn(['daily', 'weekly', 'monthly', 'custom'])
  @IsOptional()
  recurring?: RecurringType;
}

export class UpdateRsvpDto {
  @IsIn(['going', 'interested', 'not_going'])
  status: 'going' | 'interested' | 'not_going';
}