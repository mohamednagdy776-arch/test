import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { CreateSupportReportDto } from '../dto/create-support-report.dto';
import { SupportService } from '../services/support.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../auth/entities/user.entity';
import { ok } from '../../common/response.helper';

// Attachments (screenshots / short clips / PDFs) for a support ticket. Kept under
// uploads/support so they don't mix with post media.
const SUPPORT_DIR = join(process.cwd(), 'uploads', 'support');

const storage = diskStorage({
  destination: (req, file, cb) => {
    mkdirSync(SUPPORT_DIR, { recursive: true });
    cb(null, SUPPORT_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowed = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/pdf',
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new BadRequestException('File type not supported'), false);
};

@UseGuards(AuthGuard('jwt'))
@Controller('support')
export class SupportController {
  constructor(private supportService: SupportService) {}

  // POST /support/report — "Report a Problem" from Settings (#50). Accepts either
  // a plain JSON body or multipart/form-data (when screenshots are attached);
  // FilesInterceptor populates req.body for both, so the DTO validates in each case.
  @Post('report')
  @UseInterceptors(
    FilesInterceptor('attachments', 3, { storage, fileFilter, limits: { fileSize: 25 * 1024 * 1024 } }),
  )
  async report(
    @Body() dto: CreateSupportReportDto,
    @UploadedFiles() files: Array<{ filename: string }> = [],
    @CurrentUser() user: User,
  ) {
    const filenames = (files || []).map((f) => f.filename);
    const report = await this.supportService.createReport(user?.id ?? null, dto, filenames);
    return ok({ id: report.id }, 'تم استلام بلاغك بنجاح');
  }
}
