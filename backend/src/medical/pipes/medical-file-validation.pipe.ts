import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class MedicalFileValidationPipe implements PipeTransform {
  private readonly ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
  ];
  private readonly MAX_SIZE = 10 * 1024 * 1024; // 10MB

  transform(dto: any) {
    if (!this.ALLOWED_TYPES.includes(dto.mimeType)) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${this.ALLOWED_TYPES.join(', ')}`,
      );
    }
    if (dto.fileSize > this.MAX_SIZE) {
      throw new BadRequestException('File size must not exceed 10MB');
    }
    return dto;
  }
}
