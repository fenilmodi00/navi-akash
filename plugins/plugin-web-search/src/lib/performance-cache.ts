// Performance cache implementation for web search plugin
export interface CacheEntry<T> {
    value: T;
    timestamp: number;
    ttl: number;
}

export class PerformanceCache<T> {
    private cache = new Map<string, CacheEntry<T>>();
    private maxSize: number;
    private defaultTTL: number;

    constructor(maxSize: number = 1000, defaultTTL: number = 30 * 60 * 1000) { // 30 minutes default
        this.maxSize = maxSize;
        this.defaultTTL = defaultTTL;
    }

    set(key: string, value: T, customTTL?: number): void {
        const ttl = customTTL || this.defaultTTL;
        const entry: CacheEntry<T> = {
            value,
            timestamp: Date.now(),
            ttl
        };

        // If cache is full, remove oldest entry (LRU)
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) {
                this.cache.delete(oldestKey);
            }
        }

        this.cache.set(key, entry);
    }

    get(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }

        // Check if entry is expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        // Move to end (LRU behavior)
        this.cache.delete(key);
        this.cache.set(key, entry);

        return entry.value;
    }

    has(key: string): boolean {
        return this.get(key) !== null;
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

    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            defaultTTL: this.defaultTTL
        };
    }
}
