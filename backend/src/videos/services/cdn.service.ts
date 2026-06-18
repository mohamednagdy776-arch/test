import { Injectable } from '@nestjs/common';

@Injectable()
export class CdnService {
  private readonly cdnBaseUrl = process.env.CDN_BASE_URL || 'https://cdn.tayyibt.com';

  getVideoUrl(s3Key: string, isPrivate = false): string {
    if (!s3Key) return '';
    // For private content, a real implementation would generate signed URLs.
    // For now, return a CDN URL (signing implemented when CloudFront is configured).
    return `${this.cdnBaseUrl}/${s3Key}`;
  }

  getThumbnailUrl(s3Key: string): string {
    if (!s3Key) return '';
    return `${this.cdnBaseUrl}/${s3Key}`;
  }
}
