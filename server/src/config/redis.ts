import Redis from 'ioredis';
import { env } from './env';

interface MemoryCacheEntry {
  value: string;
  expiresAt: number;
}

class ResilientCache {
  private redis: Redis | null = null;
  private memoryCache: Map<string, MemoryCacheEntry> = new Map();
  private isRedisConnected = false;

  constructor() {
    try {
      this.redis = new Redis(env.REDIS_URL, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null,
      });

      this.redis.on('connect', () => {
        this.isRedisConnected = true;
        console.log('[Redis] Connected to Redis server.');
      });

      this.redis.on('error', () => {
        this.isRedisConnected = false;
      });

      this.redis.connect().catch(() => {
        this.isRedisConnected = false;
        console.log('[Cache] Using resilient in-memory cache provider.');
      });
    } catch {
      this.isRedisConnected = false;
      console.log('[Cache] Using resilient in-memory cache provider.');
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.isRedisConnected && this.redis) {
      try {
        return await this.redis.get(key);
      } catch {
        // Fall back
      }
    }

    const entry = this.memoryCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds = 300): Promise<void> {
    if (this.isRedisConnected && this.redis) {
      try {
        await this.redis.set(key, value, 'EX', ttlSeconds);
        return;
      } catch {
        // Fall back
      }
    }

    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    if (this.isRedisConnected && this.redis) {
      try {
        await this.redis.del(key);
      } catch {
        // fallback
      }
    }
    this.memoryCache.delete(key);
  }

  async delByPattern(patternPrefix: string): Promise<void> {
    if (this.isRedisConnected && this.redis) {
      try {
        const keys = await this.redis.keys(`${patternPrefix}*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } catch {
        // fallback
      }
    }

    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(patternPrefix)) {
        this.memoryCache.delete(key);
      }
    }
  }
}

export const cache = new ResilientCache();
