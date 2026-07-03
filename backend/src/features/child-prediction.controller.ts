import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { memoryStorage } from 'multer';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { ChildPredictionService } from './child-prediction.service';
import { signMediaPath } from '../common/utils/media-token';

const PREDICTIONS_DIR = join(process.cwd(), 'uploads', 'predictions');

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_FORMATS = new Set(['jpeg', 'png', 'webp']);
// A real parent face photo is at least ~this size. The 3-4 min generation pipeline
// used to run on anything that declared an image MIME — including a 2x2 non-face
// PNG (#742). Validate the actual bytes + a sane minimum resolution up front.
const MIN_DIMENSION = 100;

async function assertUsableFaceImage(buffer: Buffer, label: string): Promise<void> {
  let meta: sharp.Metadata;
  try {
    meta = await sharp(buffer).metadata();
  } catch {
    throw new BadRequestException(`${label} is not a valid image`);
  }
  if (!meta.format || !ALLOWED_FORMATS.has(meta.format)) {
    throw new BadRequestException(`${label} must be a JPEG, PNG, or WebP image`);
  }
  if ((meta.width ?? 0) < MIN_DIMENSION || (meta.height ?? 0) < MIN_DIMENSION) {
    throw new BadRequestException(
      `${label} is too small to be a face photo (min ${MIN_DIMENSION}x${MIN_DIMENSION}px)`,
    );
  }
}

// Auth + throttle: this drives a heavy AI pipeline. It was previously
// UNGUARDED, so anonymous clients could drive the ollama-backed upload with no
// per-account rate limit — a denial-of-wallet vector (#814).
@Controller('features/child-prediction')
@UseGuards(AuthGuard('jwt'), ThrottlerGuard)
export class ChildPredictionController {
  constructor(private readonly svc: ChildPredictionService) {}

  @Post()
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
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
    // Reject non-images / too-small images BEFORE the expensive pipeline (#742).
    await Promise.all([
      assertUsableFaceImage(files[0].buffer, 'First parent image'),
      assertUsableFaceImage(files[1].buffer, 'Second parent image'),
    ]);
    const image = await this.svc.predict(files[0].buffer, files[1].buffer);

    // Also persist the result so it has a real shareable link — the WhatsApp/
    // Telegram share buttons previously shared a static `shareUrl` pointing at
    // this tool's own homepage because the generated image only ever existed
    // as an ephemeral base64 data URI in the response, never saved anywhere
    // with an id/URL (#86).
    let mediaUrl: string | null = null;
    try {
      mkdirSync(PREDICTIONS_DIR, { recursive: true });
      const filename = `${randomUUID()}.jpg`;
      writeFileSync(join(PREDICTIONS_DIR, filename), Buffer.from(image, 'base64'));
      const mediaPath = `predictions/${filename}`;
      mediaUrl = `/api/v1/media/${mediaPath}?t=${signMediaPath(mediaPath)}`;
    } catch {
      // Sharing is best-effort; never fail the prediction itself over it.
    }

    return { success: true, image, format: 'jpeg', mediaUrl };
  }
}