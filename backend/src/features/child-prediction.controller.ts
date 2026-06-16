import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ChildPredictionService } from './child-prediction.service';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

@Controller('features/child-prediction')
export class ChildPredictionController {
  constructor(private readonly svc: ChildPredictionService) {}

  @Post()
  @HttpCode(200)
  @UseInterceptors(
    FilesInterceptor('images', 2, {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024, files: 2 },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED.has(file.mimetype)) {
          return cb(new BadRequestException('Only JPEG, PNG, or WebP images accepted'), false);
        }
        cb(null, true);
      },
    }),
  )
  async predict(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length !== 2) {
      throw new BadRequestException('Exactly two images required (field: images)');
    }
    const image = await this.svc.predict(files[0].buffer, files[1].buffer);
    return { success: true, image, format: 'jpeg' };
  }
}