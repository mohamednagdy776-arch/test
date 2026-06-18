import { IsEnum, IsNumber, IsString, Max, Min } from 'class-validator';
import { DocumentType } from '../entities/medical-document.entity';

export class InitiateMedicalUploadDto {
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @IsNumber()
  @Min(1)
  @Max(10485760)
  fileSize: number;

  @IsString()
  mimeType: string;
}
