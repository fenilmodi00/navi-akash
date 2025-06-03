/**
 * Performance optimization cache for the Akash agent
 * Implements LRU cache for frequently accessed knowledge and search results
 */

interface CacheItem<T> {
  value: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

export class PerformanceCache<T> {
  private cache = new Map<string, CacheItem<T>>();
  private maxSize: number;
  private ttl: number; // Time to live in milliseconds

  constructor(maxSize: number = 1000, ttlMinutes: number = 60) {
    this.maxSize = maxSize;
    this.ttl = ttlMinutes * 60 * 1000;
  }

  set(key: string, value: T): void {
    const now = Date.now();
    
    // Clean expired items before adding
    this.cleanExpired();
    
    // If cache is full, remove least recently used item
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      value,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now
    });
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

    const now = Date.now();
    
    // Check if item has expired
    if (now - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    // Update access metrics
    item.accessCount++;
    item.lastAccessed = now;
    
    return item.value;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  private cleanExpired(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.ttl) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => this.cache.delete(key));
  }

  private evictLRU(): void {
    let oldestKey: string | undefined;
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // Get cache statistics for monitoring
  getStats() {
    const now = Date.now();
    let totalAccess = 0;
    let expired = 0;

    for (const item of this.cache.values()) {
      totalAccess += item.accessCount;
      if (now - item.timestamp > this.ttl) {
        expired++;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalAccess,
      expired,
      hitRate: totalAccess > 0 ? (this.cache.size / totalAccess) : 0
    };
  }
}

// Global cache instances for different data types
export const knowledgeCache = new PerformanceCache<any>(500, 120); // 2 hours TTL
export const searchCache = new PerformanceCache<any>(200, 30);     // 30 minutes TTL  
export const embeddingCache = new PerformanceCache<number[]>(300, 240); // 4 hours TTL
