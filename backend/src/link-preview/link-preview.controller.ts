import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LinkPreviewService } from './link-preview.service';
import { ok } from '../common/response.helper';

@UseGuards(AuthGuard('jwt'))
@Controller('link-preview')
export class LinkPreviewController {
  constructor(private linkPreview: LinkPreviewService) {}

  @Get()
  async getPreview(@Query('url') url: string) {
    if (!url) return ok(null);
    const preview = await this.linkPreview.getPreview(url);
    return ok(preview);
  }
}
