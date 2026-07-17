import { Injectable } from '@nestjs/common';

@Injectable()
export class CdnService {
  // No CDN is actually provisioned for this deployment. The previous
  // 'https://cdn.tayyibt.com' fallback pointed at a domain that was never
  // registered, so every video/thumbnail URL built through this service
  // 404'd -- this was the real root cause behind #420/#396 and likely other
  // "thumbnail shows a placeholder" reports. Stored keys are already
  // resolvable relative paths (e.g. '/uploads/videos/x.mp4',
  // '/api/v1/media/posts/x.jpg'), not raw S3 keys, so with no CDN configured
  // we must return them unchanged (via buildUrl) rather than prefixing a
  // host -- resolveMediaUrl() on the frontend handles same-origin resolution.
  private readonly cdnBaseUrl = process.env.CDN_BASE_URL || '';

  private buildUrl(key: string): string {
    if (!key) return '';
    if (/^https?:\/\//i.test(key)) return key;
    if (!this.cdnBaseUrl) return key.startsWith('/') ? key : `/${key}`;
    return `${this.cdnBaseUrl}/${key.replace(/^\//, '')}`;
  }

  getVideoUrl(s3Key: string, isPrivate = false): string {
    // For private content, a real implementation would generate signed URLs.
    // For now, return a CDN URL (signing implemented when CloudFront is configured).
    return this.buildUrl(s3Key);
  }

  getThumbnailUrl(s3Key: string): string {
    return this.buildUrl(s3Key);
  }
}
