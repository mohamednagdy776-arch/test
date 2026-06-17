import { Controller, Get, Param, Query, Res, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { existsSync } from 'fs';
import { join } from 'path';
import { verifyMediaToken } from '../common/utils/media-token';

@Controller('media')
export class MediaController {
  @Get(':type/:filename')
  async serveMedia(
    @Param('type') type: string,
    @Param('filename') filename: string,
    @Query('t') token: string,
    @Res() res: Response,
  ) {
    const allowed = new Set(['avatars', 'covers', 'posts', 'stories']);
    if (!allowed.has(type)) throw new NotFoundException();

    const mediaPath = `${type}/${filename}`;
    if (!token || !verifyMediaToken(mediaPath, token)) {
      throw new UnauthorizedException('Invalid or missing media token');
    }

    const filePath = join(process.cwd(), 'uploads', type, filename);
    if (!existsSync(filePath)) throw new NotFoundException('Media not found');

    res.sendFile(filePath);
  }
}
