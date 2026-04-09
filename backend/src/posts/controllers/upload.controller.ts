import { Controller, Post, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ok } from '../../common/response.helper';

const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedImage = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideo = ['video/mp4', 'video/webm', 'video/quicktime'];
  if (allowedImage.includes(file.mimetype) || allowedVideo.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported'), false);
  }
};

@UseGuards(AuthGuard('jwt'))
@Controller('upload')
export class UploadController {
  @Post('media')
  @UseInterceptors(FileInterceptor('file', { storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } }))
  async uploadMedia(@UploadedFile() file: any) {
    const url = `/uploads/${file.filename}`;
    const type = file.mimetype.startsWith('video/') ? 'video' : 'image';
    return ok({ url, type, filename: file.filename }, 'File uploaded');
  }
}