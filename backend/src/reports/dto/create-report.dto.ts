import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

// Matches the web app's report payload: { entityType, entityId, reason, details? }.
export class CreateReportDto {
  @IsEnum(['user', 'post', 'group', 'video', 'comment'])
  entityType: 'user' | 'post' | 'group' | 'video' | 'comment';

  @IsUUID()
  entityId: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  details?: string;
}
