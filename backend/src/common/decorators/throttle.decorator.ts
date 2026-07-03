import { Throttle } from '@nestjs/throttler';

// 5 attempts / 15 min was tripping on normal typo-retry usage and shared/NAT'd
// IPs (offices, campuses), locking out users with valid credentials for up to
// 15 minutes (#139). Still a real anti-brute-force limit, just less trigger-happy.
export const LoginThrottle = () => Throttle({ default: { limit: 10, ttl: 600000 } });
export const OtpThrottle = () => Throttle({ default: { limit: 3, ttl: 600000 } });
export const UploadThrottle = () => Throttle({ default: { limit: 3, ttl: 3600000 } });
export const MatchThrottle = () => Throttle({ default: { limit: 30, ttl: 3600000 } });
