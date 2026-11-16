import Redis from 'ioredis';
import { ENV } from './env.js';

class InMemoryCache {
  private store: Map<string, { value: string; expiry: number | null }> = new Map();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiry && item.expiry < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    let expiry: number | null = null;
    if (mode === 'EX' && duration) {
      expiry = Date.now() + duration * 1000;
    }
    this.store.set(key, { value, expiry });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    const existed = this.store.delete(key);
    return existed ? 1 : 0;
  }

  async flushall(): Promise<'OK'> {
    this.store.clear();
    return 'OK';
  }
}

class CacheService {
  private redisClient: Redis | null = null;
  private fallbackCache: InMemoryCache = new InMemoryCache();
  public isRedisConnected: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      this.redisClient = new Redis(ENV.REDIS_URL, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // Do not spam retries if offline
      });

      this.redisClient.on('connect', () => {
        this.isRedisConnected = true;
        console.log('⚡ Redis Cache Connected Successfully.');
      });

      this.redisClient.on('error', (err) => {
        if (this.isRedisConnected) {
          console.warn('⚠️ Redis Connection Lost. Falling back to In-Memory Cache.');
        }
        this.isRedisConnected = false;
      });

      this.redisClient.connect().catch(() => {
        this.isRedisConnected = false;
        console.log('ℹ️ Redis unavailable. Using automated In-Memory Cache fallback.');
      });
    } catch {
      this.isRedisConnected = false;
      console.log('ℹ️ Redis initialization skipped. Using automated In-Memory Cache fallback.');
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.isRedisConnected && this.redisClient) {
      try {
        return await this.redisClient.get(key);
      } catch {
        return await this.fallbackCache.get(key);
      }
    }
    return await this.fallbackCache.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<'OK'> {
    if (this.isRedisConnected && this.redisClient) {
      try {
        if (ttlSeconds) {
          return (await this.redisClient.set(key, value, 'EX', ttlSeconds)) as 'OK';
        }
        return (await this.redisClient.set(key, value)) as 'OK';
      } catch {
        return await this.fallbackCache.set(key, value, ttlSeconds ? 'EX' : undefined, ttlSeconds);
      }
    }
    return await this.fallbackCache.set(key, value, ttlSeconds ? 'EX' : undefined, ttlSeconds);
  }

  async del(key: string): Promise<number> {
    if (this.isRedisConnected && this.redisClient) {
      try {
        return await this.redisClient.del(key);
      } catch {
        return await this.fallbackCache.del(key);
      }
    }
    return await this.fallbackCache.del(key);
  }
}

export const cache = new CacheService();
