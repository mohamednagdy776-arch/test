import { IsEnum, IsUUID } from 'class-validator';
import { ConsentType } from '../entities/consent-request.entity';

export class CreateConsentRequestDto {
  @IsUUID()
  targetUserId: string;

  @IsEnum(ConsentType)
  consentType: ConsentType;
}
