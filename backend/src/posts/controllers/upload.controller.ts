import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { ok } from '../../common/response.helper';
import { signMediaPath } from '../../common/utils/media-token';

// Post / story / chat media lives under uploads/posts so it can be served by the
// token-protected MediaController (GET /api/v1/media/posts/:file?t=...), the same
// scheme used for avatars/covers. (#media — the old /uploads/<file> flat path was
// no longer served once static hosting moved behind signed tokens.)
const POSTS_DIR = join(process.cwd(), 'uploads', 'posts');

const storage = diskStorage({
  destination: (req, file, cb) => {
    mkdirSync(POSTS_DIR, { recursive: true });
    cb(null, POSTS_DIR);
  },
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
    cb(new BadRequestException('File type not supported'), false);
  }
};

@UseGuards(AuthGuard('jwt'))
@Controller('upload')
export class UploadController {
  @Post('media')
  @UseInterceptors(FileInterceptor('file', { storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } }))
  async uploadMedia(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('No file uploaded');
    const mediaPath = `posts/${file.filename}`;
    const token = signMediaPath(mediaPath);
    const url = `/api/v1/media/${mediaPath}?t=${token}`;
    const type = file.mimetype.startsWith('video/') ? 'video' : 'image';
    return ok({ url, type, filename: file.filename }, 'File uploaded');
  }
}
