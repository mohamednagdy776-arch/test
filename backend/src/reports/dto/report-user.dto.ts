import { IsString, IsOptional, MaxLength } from 'class-validator';

export class ReportUserDto {
  // A reason id from GET /reports/reasons. Validated against the catalog in the
  // service so the list stays a single source of truth.
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  details?: string;
}
