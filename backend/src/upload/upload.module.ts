import { Module } from '@nestjs/common';
import { UploadController } from '../posts/controllers/upload.controller';

@Module({
  controllers: [UploadController],
})
export class UploadModule {}