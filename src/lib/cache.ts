// Simple in-memory cache with TTL
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();

  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
export const analyticsCache = new MemoryCache();

// Cache key generators
export function getCacheKey(type: string, params: Record<string, unknown>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return `${type}:${sortedParams}`;
}

// Decorator for caching async functions
export function withCache<T>(
  cacheKey: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  const cached = analyticsCache.get<T>(cacheKey);
  if (cached) {
    return Promise.resolve(cached);
  }

  return fn().then((data) => {
    analyticsCache.set(cacheKey, data, ttlSeconds);
    return data;
  });
}

// Clear cache entries matching a pattern
export function clearCache(pattern?: string): void {
  analyticsCache.invalidate(pattern);
}

// Get cache statistics
export function getCacheStats(): { size: number; keys: string[] } {
  return analyticsCache.getStats();
}
