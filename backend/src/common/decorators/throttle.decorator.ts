import { Throttle } from '@nestjs/throttler';

export const LoginThrottle = () => Throttle({ default: { limit: 5, ttl: 900000 } });
export const OtpThrottle = () => Throttle({ default: { limit: 3, ttl: 600000 } });
export const UploadThrottle = () => Throttle({ default: { limit: 3, ttl: 3600000 } });
export const MatchThrottle = () => Throttle({ default: { limit: 30, ttl: 3600000 } });
