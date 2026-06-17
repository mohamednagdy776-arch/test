import { createHmac } from 'crypto';

export function signMediaPath(mediaPath: string): string {
  const secret = process.env.JWT_SECRET || 'tayyibt-media-secret';
  return createHmac('sha256', secret).update(mediaPath).digest('hex').slice(0, 24);
}

export function verifyMediaToken(mediaPath: string, token: string): boolean {
  return signMediaPath(mediaPath) === token;
}
