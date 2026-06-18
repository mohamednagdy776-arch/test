import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

export const CACHE_TTL = {
  SESSION: 7 * 24 * 60 * 60,        // 7 days
  RATE_LIMIT: 15 * 60,               // 15 min
  FEED: 5 * 60,                      // 5 min
  MATCH_SCORE: 24 * 60 * 60,         // 24 hours
  REACTION_COUNT: 60 * 60,           // 1 hour
  NOTIFICATION_UNREAD: 30 * 60,      // 30 min
  ONLINE_PRESENCE: 35,               // 35 seconds
};

export const CACHE_KEYS = {
  feed: (userId: string) => `feed:${userId}`,
  matchScore: (userA: string, userB: string) => {
    const [a, b] = [userA, userB].sort();
    return `match:score:${a}:${b}`;
  },
  topMatches: (userId: string) => `top_matches:${userId}`,
  reactionCount: (postId: string) => `post_reactions:${postId}`,
  userOnline: (userId: string) => `user_online:${userId}`,
  sessionToken: (tokenHash: string) => `session:${tokenHash}`,
  revokedToken: (tokenHash: string) => `revoked_token:${tokenHash}`,
  notifUnread: (userId: string) => `notif_unread:${userId}`,
};

@Injectable()
export class RedisCacheService implements OnModuleInit {
  private client: RedisClientType;

  async onModuleInit() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD,
    }) as RedisClientType;

    this.client.on('error', (err) => console.error('Redis error:', err));
    await this.client.connect().catch(err => console.error('Redis connection failed:', err));
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    try {
      await this.client.setEx(key, ttlSeconds, value);
    } catch (err) {
      console.error('Redis set error:', err);
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch {}
  }

  async hIncrBy(key: string, field: string, increment: number): Promise<void> {
    try {
      await this.client.hIncrBy(key, field, increment);
    } catch {}
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    try {
      return await this.client.hGetAll(key);
    } catch {
      return {};
    }
  }

  async setUserOnline(userId: string): Promise<void> {
    await this.set(CACHE_KEYS.userOnline(userId), '1', CACHE_TTL.ONLINE_PRESENCE);
  }

  async isUserOnline(userId: string): Promise<boolean> {
    const val = await this.get(CACHE_KEYS.userOnline(userId));
    return val === '1';
  }

  async revokeToken(tokenHash: string, ttlSeconds: number): Promise<void> {
    await this.set(CACHE_KEYS.revokedToken(tokenHash), '1', ttlSeconds);
  }

  async isTokenRevoked(tokenHash: string): Promise<boolean> {
    const val = await this.get(CACHE_KEYS.revokedToken(tokenHash));
    return val === '1';
  }
}
