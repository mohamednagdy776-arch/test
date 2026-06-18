import { IsBoolean } from 'class-validator';

export class RespondConsentDto {
  @IsBoolean()
  accept: boolean;
}
