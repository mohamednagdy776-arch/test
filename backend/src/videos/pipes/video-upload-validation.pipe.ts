import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class VideoUploadValidationPipe implements PipeTransform {
  private readonly ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
  private readonly MAX_SIZE = 100 * 1024 * 1024; // 100MB
  private readonly MIN_DURATION = 15;
  private readonly MAX_DURATION = 90;

  transform(dto: any) {
    if (dto.mimeType && !this.ALLOWED_TYPES.includes(dto.mimeType)) {
      throw new BadRequestException(
        `نوع الملف غير مسموح به / File type not allowed. Allowed: ${this.ALLOWED_TYPES.join(', ')}`,
      );
    }
    if (dto.fileSize && dto.fileSize > this.MAX_SIZE) {
      throw new BadRequestException(
        'حجم الملف يتجاوز الحد المسموح / File size exceeds 100MB limit',
      );
    }
    if (dto.durationSeconds !== undefined) {
      if (dto.durationSeconds < this.MIN_DURATION) {
        throw new BadRequestException(
          'مدة الفيديو يجب أن تكون 15 ثانية على الأقل / Video must be at least 15 seconds',
        );
      }
      if (dto.durationSeconds > this.MAX_DURATION) {
        throw new BadRequestException(
          'مدة الفيديو يجب أن تكون 90 ثانية كحد أقصى / Video must not exceed 90 seconds',
        );
      }
    }
    return dto;
  }
}
