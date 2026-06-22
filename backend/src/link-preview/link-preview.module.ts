import { Module } from '@nestjs/common';
import { LinkPreviewController } from './link-preview.controller';
import { LinkPreviewService } from './link-preview.service';

// Shared Open Graph link-preview used by chat (on-demand) and posts (enrichment
// on create). RedisCacheService comes from the @Global CommonModule.
@Module({
  controllers: [LinkPreviewController],
  providers: [LinkPreviewService],
  exports: [LinkPreviewService],
})
export class LinkPreviewModule {}
